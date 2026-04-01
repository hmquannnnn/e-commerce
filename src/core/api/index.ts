import axios, { type AxiosInstance } from 'axios';
import { toast } from 'sonner';
import { store } from '@/src/core/store/store';
import { clearAuth, setAccessToken } from '@/src/core/store/auth.slice';
import { EHttpStatusCode } from '@/src/shared/constants/http-status-code.enum';
import type { IApiResponse } from './interface';
import type { IRefreshTokenResponse } from '@/src/features/auth/interfaces';

const defaultApiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
if (defaultApiEndpoint === undefined || defaultApiEndpoint.trim() === '') {
	throw new Error('Missing NEXT_PUBLIC_API_ENDPOINT env var');
}

interface IInitializeApiClientConfigs {
	baseURL?: string;
}

interface IInitializeApiClientCustomConfigs {
	includeAuthHeader?: boolean;
}

const apiSingletonInstancesMap = new Map<string, AxiosInstance>();

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: unknown) => void }> = [];

const flushQueue = (token: string | null, error: unknown = null) => {
	failedQueue.forEach(({ resolve, reject }) => (token ? resolve(token) : reject(error)));
	failedQueue = [];
};

/**
 *
 * @param configs axios instance configs
 * @param instanceKey unique key for the singleton api instance, if not provided, baseURL will be used as the key
 * @returns existed axios instance with same `instanceKey`, otherwise a new axios instance
 */
const initializeApiClientInstance = (
	{ includeAuthHeader = true, ...configs }: IInitializeApiClientConfigs & IInitializeApiClientCustomConfigs,
	instanceKey?: string
) => {
	const baseURL = String(configs.baseURL || defaultApiEndpoint);
	const combinedInstanceKey = `${instanceKey || baseURL}_${JSON.stringify({ ...configs, includeAuthHeader })}`;

	if (apiSingletonInstancesMap.has(combinedInstanceKey))
		return apiSingletonInstancesMap.get(combinedInstanceKey) as AxiosInstance;

	const apiClient = axios.create({
		baseURL,
		...configs,
	});

	if (includeAuthHeader) {
		apiClient.interceptors.request.use((config) => {
			const tokenFromStore = (() => {
				try {
					return store.getState().auth.accessToken as string | undefined;
				} catch {
					return undefined;
				}
			})();

			const tokenFromPersist = (() => {
				try {
					if (typeof window === 'undefined') return undefined;
					const raw = window.localStorage.getItem('persist:root');
					if (!raw) return undefined;
					const persisted = JSON.parse(raw) as Record<string, string>;
					if (!persisted.auth) return undefined;
					const auth = JSON.parse(persisted.auth) as { accessToken?: string };
					return auth.accessToken;
				} catch {
					return undefined;
				}
			})();

			const accessToken = tokenFromStore || tokenFromPersist;
			if (accessToken) {
				config.headers = config.headers ?? {};
				(config.headers as Record<string, string>).Authorization = `Bearer ${accessToken}`;
			}
			return config;
		});

		apiClient.interceptors.response.use(
			(response) => response,
			async (error: unknown) => {
				if (!axios.isAxiosError(error)) return Promise.reject(error);

				const originalRequest = error.config;
				const status = error.response?.status;

				if (status !== EHttpStatusCode.unauthenticated || !originalRequest) {
					return Promise.reject(error);
				}

				if (isRefreshing) {
					return new Promise<string>((resolve, reject) => {
						failedQueue.push({ resolve, reject });
					}).then((newToken) => {
						(originalRequest.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
						return apiClient(originalRequest);
					});
				}

				isRefreshing = true;

				try {
					const storedRefreshToken = store.getState().auth.refreshToken;
					const refreshResponse = await axios.post<IApiResponse<IRefreshTokenResponse>>(
						`${baseURL}/auth/refresh-token`,
						{ refresh_token: storedRefreshToken }
					);

					const newAccessToken = refreshResponse.data.data.access_token;
					store.dispatch(setAccessToken(newAccessToken));
					flushQueue(newAccessToken);

					(originalRequest.headers as Record<string, string>).Authorization = `Bearer ${newAccessToken}`;
					return apiClient(originalRequest);
				} catch (refreshError) {
					store.dispatch(clearAuth());
					flushQueue(null, refreshError);
					toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
					if (typeof window !== 'undefined') {
						window.location.href = '/';
					}
					return Promise.reject(refreshError);
				} finally {
					isRefreshing = false;
				}
			}
		);
	}

	apiSingletonInstancesMap.set(combinedInstanceKey, apiClient);

	return apiClient;
};

export { initializeApiClientInstance };
