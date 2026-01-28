import type { DefaultError } from '@tanstack/react-query';

export interface IApiResponse<T> {
	data: T;
	message: string;
	statusCode: number;
}

export interface IApiErrorResponse {
	errorCode: string;
	statusCode: number;
}

export interface CustomHookMutationParams<
	TData = unknown,
	TError = DefaultError,
	TVariables = void,
	TContext = unknown,
> {
	meta?: Record<string, unknown>;
	onSuccess?: (data: TData) => void;
	onError?: (error: TError) => void;
	onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables, context: TContext) => void;
}
