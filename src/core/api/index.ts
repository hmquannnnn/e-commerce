import axios, { type AxiosInstance } from 'axios';
import { store } from '@/src/core/store/store';

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
	}

	apiSingletonInstancesMap.set(combinedInstanceKey, apiClient);

	return apiClient;
};

export { initializeApiClientInstance };
