'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { initializeApiClientInstance } from '@/src/core/api';
import { useAppSelector } from '@/src/core/store/store';
import type { IOrder, IOrderListResponse, OrderStatus } from '@/src/features/order/interfaces';
import { ADMIN_ORDER_QUERY_KEYS } from './query-keys';

const authClient = initializeApiClientInstance({ includeAuthHeader: true });

type Envelope<T> = { success: boolean; message: string; data: T };

const getAdminOrders = async (
	page: number,
	limit: number,
	status?: OrderStatus,
	search = ''
): Promise<IOrderListResponse> => {
	const params: Record<string, string | number> = { page, limit };
	if (status) params.status = status;
	if (search.trim()) params.search = search.trim();
	const res = await authClient.get<Envelope<IOrderListResponse>>('/admin/orders', { params });
	return res.data.data;
};

export const useAdminOrders = (page: number, limit = 20, status?: OrderStatus, search = '') => {
	const isAdmin = useAppSelector((s) => s.auth.user?.role === 'admin');
	return useQuery({
		queryKey: ADMIN_ORDER_QUERY_KEYS.list(page, limit, status, search),
		queryFn: () => getAdminOrders(page, limit, status, search),
		enabled: isAdmin,
	});
};

const getAdminOrder = async (id: string): Promise<IOrder> => {
	const res = await authClient.get<Envelope<IOrder>>(`/admin/orders/${id}`);
	return res.data.data;
};

export const useAdminOrder = (id: string, enabled = true) => {
	const isAdmin = useAppSelector((s) => s.auth.user?.role === 'admin');
	return useQuery({
		queryKey: ADMIN_ORDER_QUERY_KEYS.detail(id),
		queryFn: () => getAdminOrder(id),
		enabled: enabled && isAdmin && !!id,
	});
};

export interface IUpdateOrderStatusVariables {
	orderId: string;
	status: OrderStatus;
}

export const useAdminUpdateOrderStatus = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ orderId, status }: IUpdateOrderStatusVariables): Promise<void> => {
			await authClient.patch(`/admin/orders/${orderId}/status`, { status });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ADMIN_ORDER_QUERY_KEYS.all });
		},
	});
};

export const getAdminOrderErrorCode = (err: unknown): string | undefined => {
	if (!axios.isAxiosError(err)) return undefined;
	const data = err.response?.data as { error?: string } | undefined;
	return data?.error;
};
