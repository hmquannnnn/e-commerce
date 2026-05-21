'use client';

import { useQuery } from '@tanstack/react-query';
import { initializeApiClientInstance } from '@/src/core/api';
import { IApiResponse } from '@/src/core/api/interface';
import { ILocationUnit } from '../interfaces';
import { LOCATION_QUERY_KEYS } from './query-keys';

// Public endpoints — không cần auth header. Data tĩnh (chuẩn 63 tỉnh, không đổi)
// nên cache vĩnh viễn trong session.
const publicClient = initializeApiClientInstance({ includeAuthHeader: false }, 'public');

const getProvinces = (): Promise<ILocationUnit[]> =>
	publicClient.get<IApiResponse<ILocationUnit[]>>('/locations/provinces').then((res) => res.data.data);

const getDistricts = (provinceCode: string): Promise<ILocationUnit[]> =>
	publicClient
		.get<IApiResponse<ILocationUnit[]>>('/locations/districts', { params: { province_code: provinceCode } })
		.then((res) => res.data.data);

const getWards = (districtCode: string): Promise<ILocationUnit[]> =>
	publicClient
		.get<IApiResponse<ILocationUnit[]>>('/locations/wards', { params: { district_code: districtCode } })
		.then((res) => res.data.data);

export const useProvinces = () =>
	useQuery({
		queryKey: LOCATION_QUERY_KEYS.provinces(),
		queryFn: getProvinces,
		staleTime: Infinity,
		gcTime: Infinity,
	});

export const useDistricts = (provinceCode: string) =>
	useQuery({
		queryKey: LOCATION_QUERY_KEYS.districts(provinceCode),
		queryFn: () => getDistricts(provinceCode),
		enabled: !!provinceCode,
		staleTime: Infinity,
		gcTime: Infinity,
	});

export const useWards = (districtCode: string) =>
	useQuery({
		queryKey: LOCATION_QUERY_KEYS.wards(districtCode),
		queryFn: () => getWards(districtCode),
		enabled: !!districtCode,
		staleTime: Infinity,
		gcTime: Infinity,
	});
