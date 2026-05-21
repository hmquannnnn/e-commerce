const formatSpecValue = (value: unknown): string => {
	if (value === null || value === undefined) return '';
	if (typeof value === 'string') return value;
	if (typeof value === 'number' || typeof value === 'boolean') return String(value);

	try {
		return JSON.stringify(value);
	} catch {
		return String(value);
	}
};

export interface LegacyProductSpecFormItem {
	key: string;
	value: string;
}

export const specsRecordToFormItems = (specs?: Record<string, unknown>): LegacyProductSpecFormItem[] => {
	if (!specs || Object.keys(specs).length === 0) return [];

	return Object.entries(specs).map(([key, value]) => ({
		key,
		value: formatSpecValue(value),
	}));
};

export const specsFormItemsToRecord = (specs: LegacyProductSpecFormItem[]): Record<string, string> | undefined => {
	const entries = specs.map((spec) => [spec.key.trim(), spec.value.trim()] as const).filter(([key]) => key.length > 0);

	if (entries.length === 0) return undefined;

	return Object.fromEntries(entries);
};
