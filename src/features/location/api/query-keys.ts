export const LOCATION_QUERY_KEYS = {
	all: ['location'] as const,
	provinces: () => [...LOCATION_QUERY_KEYS.all, 'provinces'] as const,
	districts: (provinceCode: string) => [...LOCATION_QUERY_KEYS.all, 'districts', provinceCode] as const,
	wards: (districtCode: string) => [...LOCATION_QUERY_KEYS.all, 'wards', districtCode] as const,
};
