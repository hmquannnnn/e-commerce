import { initializeApiClientInstance } from '@/src/core/api';
import {
	ILoginRequest,
	ILoginResponse,
	IRefreshTokenRequest,
	IRefreshTokenResponse,
	IRegisterRequest,
	IRegisterResponse,
} from '../interfaces';
import { DefaultError, useMutation } from '@tanstack/react-query';
import { CustomHookMutationParams, IApiResponse } from '@/src/core/api/interface';

const queryClient = initializeApiClientInstance({});

const login = async (request: ILoginRequest) =>
	queryClient.post<IApiResponse<ILoginResponse>>('/auth/login', request).then((response) => response.data);

export const useLogin = (
	params: CustomHookMutationParams<IApiResponse<ILoginResponse>, DefaultError, ILoginRequest>
) => {
	return useMutation({
		mutationFn: login,
		...(params ?? {}),
	});
};

const register = async (request: IRegisterRequest) =>
	queryClient.post<IApiResponse<IRegisterResponse>>('/auth/register', request).then((response) => response.data);

export const useRegister = (
	params: CustomHookMutationParams<IApiResponse<IRegisterResponse>, DefaultError, IRegisterRequest>
) => {
	return useMutation({
		mutationFn: register,
		...(params ?? {}),
	});
};

const refreshToken = async (request: IRefreshTokenRequest) =>
	queryClient.post<IApiResponse<IRefreshTokenResponse>>('/auth/refresh', request).then((response) => response.data);

export const useRefreshToken = () => {
	return useMutation({
		mutationFn: refreshToken,
	});
};
