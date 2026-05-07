'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { initializeApiClientInstance } from '@/src/core/api';
import { useAppSelector } from '@/src/core/store/store';
import { ICreatePaymentRequest, IPayment } from '../interfaces';
import { PAYMENT_QUERY_KEYS } from './query-keys';

type PaymentEnvelope<T> = { success: boolean; message: string; data: T };

const authClient = initializeApiClientInstance({ includeAuthHeader: true });

const createPayment = async (body: ICreatePaymentRequest): Promise<IPayment> => {
	const res = await authClient.post<PaymentEnvelope<IPayment>>('/payments', body);
	return res.data.data;
};

const getPaymentByOrder = async (orderId: string): Promise<IPayment> => {
	const res = await authClient.get<PaymentEnvelope<IPayment>>(`/payments/order/${orderId}`);
	return res.data.data;
};

export const useCreatePayment = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createPayment,
		onSuccess: (payment) => {
			queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.all });
			queryClient.setQueryData(PAYMENT_QUERY_KEYS.byOrder(payment.order_id), payment);
		},
	});
};

export const usePaymentByOrder = (orderId: string, enabled = true) => {
	const isAuthenticated = useAppSelector((state) => !!state.auth.accessToken);
	return useQuery({
		queryKey: PAYMENT_QUERY_KEYS.byOrder(orderId),
		queryFn: () => getPaymentByOrder(orderId),
		enabled: !!orderId && isAuthenticated && enabled,
		refetchInterval: (query) => {
			const status = query.state.data?.status;
			if (status === 'pending' || status === 'processing' || status === 'requires_action') {
				return 2000;
			}
			return false;
		},
	});
};

export const getPaymentErrorCode = (err: unknown): string | undefined => {
	if (!axios.isAxiosError(err)) return undefined;
	const data = err.response?.data as { error?: string } | undefined;
	return data?.error;
};
