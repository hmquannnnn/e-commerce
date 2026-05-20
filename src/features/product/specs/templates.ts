export type ProductSpecTemplateKey = 'camera_drone_v1' | 'agriculture_uav_v1' | 'uav_accessory_v1';

export type ProductSpecsFormValues = Record<string, Record<string, string>>;
export type ProductSpecsPayload = {
	template: ProductSpecTemplateKey;
	template_version: number;
	category_id: number;
	[group: string]: unknown;
};

export interface ProductSpecFieldDefinition {
	key: string;
	labelKey: string;
	required: boolean;
}

export interface ProductSpecGroupDefinition {
	key: string;
	labelKey: string;
	fields: ProductSpecFieldDefinition[];
}

export interface ProductSpecTemplateDefinition {
	key: ProductSpecTemplateKey;
	categoryId: number;
	labelKey: string;
	groups: ProductSpecGroupDefinition[];
}

export interface ProductSpecDisplayField extends ProductSpecFieldDefinition {
	value: string;
}

export interface ProductSpecDisplayGroup extends Omit<ProductSpecGroupDefinition, 'fields'> {
	fields: ProductSpecDisplayField[];
}

const field = (groupKey: string, key: string, required = false): ProductSpecFieldDefinition => ({
	key,
	labelKey: `product.specs.fields.${groupKey}.${key}`,
	required,
});

export const PRODUCT_SPEC_TEMPLATES: Record<ProductSpecTemplateKey, ProductSpecTemplateDefinition> = {
	camera_drone_v1: {
		key: 'camera_drone_v1',
		categoryId: 1,
		labelKey: 'product.specs.templates.camera_drone_v1',
		groups: [
			{
				key: 'aircraft',
				labelKey: 'product.specs.groups.aircraft',
				fields: [
					field('aircraft', 'weight', true),
					field('aircraft', 'dimensions', true),
					field('aircraft', 'max_flight_time', true),
					field('aircraft', 'max_transmission_distance', true),
					field('aircraft', 'max_speed'),
					field('aircraft', 'max_takeoff_altitude'),
					field('aircraft', 'max_wind_resistance'),
					field('aircraft', 'gnss'),
					field('aircraft', 'operating_temperature'),
				],
			},
			{
				key: 'camera',
				labelKey: 'product.specs.groups.camera',
				fields: [
					field('camera', 'sensor', true),
					field('camera', 'max_video_resolution', true),
					field('camera', 'lens'),
					field('camera', 'aperture'),
					field('camera', 'max_photo_resolution'),
					field('camera', 'photo_format'),
					field('camera', 'video_format'),
					field('camera', 'digital_zoom'),
				],
			},
			{
				key: 'gimbal',
				labelKey: 'product.specs.groups.gimbal',
				fields: [
					field('gimbal', 'stabilization', true),
					field('gimbal', 'mechanical_range'),
					field('gimbal', 'controllable_range'),
				],
			},
			{
				key: 'sensing',
				labelKey: 'product.specs.groups.sensing',
				fields: [
					field('sensing', 'system', true),
					field('sensing', 'forward'),
					field('sensing', 'backward'),
					field('sensing', 'downward'),
					field('sensing', 'operating_environment'),
				],
			},
			{
				key: 'transmission',
				labelKey: 'product.specs.groups.transmission',
				fields: [
					field('transmission', 'system'),
					field('transmission', 'frequency'),
					field('transmission', 'live_view_quality'),
				],
			},
			{
				key: 'battery',
				labelKey: 'product.specs.groups.battery',
				fields: [
					field('battery', 'capacity', true),
					field('battery', 'charging_time'),
					field('battery', 'battery_type'),
				],
			},
			{
				key: 'storage',
				labelKey: 'product.specs.groups.storage',
				fields: [field('storage', 'internal_storage'), field('storage', 'supported_sd_cards')],
			},
		],
	},
	agriculture_uav_v1: {
		key: 'agriculture_uav_v1',
		categoryId: 2,
		labelKey: 'product.specs.templates.agriculture_uav_v1',
		groups: [
			{
				key: 'aircraft',
				labelKey: 'product.specs.groups.aircraft',
				fields: [
					field('aircraft', 'dimensions', true),
					field('aircraft', 'weight', true),
					field('aircraft', 'max_takeoff_weight', true),
					field('aircraft', 'rtk_gnss'),
					field('aircraft', 'hovering_accuracy'),
					field('aircraft', 'max_wind_resistance'),
				],
			},
			{
				key: 'spraying',
				labelKey: 'product.specs.groups.spraying',
				fields: [
					field('spraying', 'tank_capacity', true),
					field('spraying', 'max_flow_rate', true),
					field('spraying', 'spray_width', true),
					field('spraying', 'droplet_size'),
					field('spraying', 'nozzle_count'),
					field('spraying', 'pump_type'),
				],
			},
			{
				key: 'spreading',
				labelKey: 'product.specs.groups.spreading',
				fields: [
					field('spreading', 'tank_capacity'),
					field('spreading', 'payload'),
					field('spreading', 'material_diameter'),
					field('spreading', 'spreading_width'),
				],
			},
			{
				key: 'sensing',
				labelKey: 'product.specs.groups.sensing',
				fields: [
					field('sensing', 'system', true),
					field('sensing', 'obstacle_detection_range'),
					field('sensing', 'terrain_following'),
				],
			},
			{
				key: 'battery',
				labelKey: 'product.specs.groups.battery',
				fields: [
					field('battery', 'model', true),
					field('battery', 'capacity', true),
					field('battery', 'voltage', true),
					field('battery', 'weight'),
				],
			},
			{
				key: 'remote_controller',
				labelKey: 'product.specs.groups.remote_controller',
				fields: [
					field('remote_controller', 'model'),
					field('remote_controller', 'screen'),
					field('remote_controller', 'transmission_distance'),
				],
			},
		],
	},
	uav_accessory_v1: {
		key: 'uav_accessory_v1',
		categoryId: 3,
		labelKey: 'product.specs.templates.uav_accessory_v1',
		groups: [
			{
				key: 'accessory',
				labelKey: 'product.specs.groups.accessory',
				fields: [
					field('accessory', 'type', true),
					field('accessory', 'compatible_models', true),
					field('accessory', 'main_function', true),
				],
			},
			{
				key: 'physical',
				labelKey: 'product.specs.groups.physical',
				fields: [field('physical', 'dimensions'), field('physical', 'weight'), field('physical', 'material')],
			},
			{
				key: 'power',
				labelKey: 'product.specs.groups.power',
				fields: [
					field('power', 'capacity'),
					field('power', 'voltage'),
					field('power', 'power'),
					field('power', 'charging_time'),
				],
			},
			{
				key: 'package',
				labelKey: 'product.specs.groups.package',
				fields: [field('package', 'included_items'), field('package', 'quantity')],
			},
		],
	},
};

export const SPEC_TEMPLATE_BY_CATEGORY_ID: Record<number, ProductSpecTemplateKey> = {
	1: 'camera_drone_v1',
	2: 'agriculture_uav_v1',
	3: 'uav_accessory_v1',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

export const getSpecTemplate = (templateKey: unknown): ProductSpecTemplateDefinition | undefined => {
	if (typeof templateKey !== 'string') return undefined;
	return PRODUCT_SPEC_TEMPLATES[templateKey as ProductSpecTemplateKey];
};

export const getSpecTemplateByCategoryId = (categoryId: number | string | null | undefined) => {
	const numericCategoryId = Number(categoryId);
	if (!Number.isInteger(numericCategoryId)) return undefined;
	return getSpecTemplate(SPEC_TEMPLATE_BY_CATEGORY_ID[numericCategoryId]);
};

export const createEmptySpecsForTemplate = (template: ProductSpecTemplateDefinition): ProductSpecsFormValues =>
	template.groups.reduce<ProductSpecsFormValues>((groups, group) => {
		groups[group.key] = group.fields.reduce<Record<string, string>>((fields, specField) => {
			fields[specField.key] = '';
			return fields;
		}, {});
		return groups;
	}, {});

export const getRequiredSpecFieldsByCategoryId = (categoryId: number | string | null | undefined) => {
	const template = getSpecTemplateByCategoryId(categoryId);
	if (!template) return [];

	return template.groups.flatMap((group) =>
		group.fields.filter((specField) => specField.required).map((specField) => ({ group, field: specField }))
	);
};

export const buildProductSpecsPayload = (
	categoryId: number | string,
	formSpecs: ProductSpecsFormValues
): ProductSpecsPayload => {
	const template = getSpecTemplateByCategoryId(categoryId);
	if (!template) {
		return {
			template: 'camera_drone_v1',
			template_version: 1,
			category_id: Number(categoryId),
		};
	}

	return template.groups.reduce<ProductSpecsPayload>(
		(payload, group) => {
			const groupValues = formSpecs[group.key] ?? {};
			const values = group.fields.reduce<Record<string, string>>((acc, specField) => {
				const value = groupValues[specField.key]?.trim();
				if (value) acc[specField.key] = value;
				return acc;
			}, {});

			if (Object.keys(values).length > 0) payload[group.key] = values;
			return payload;
		},
		{
			template: template.key,
			template_version: 1,
			category_id: template.categoryId,
		}
	);
};

export const getSpecTemplateFromSpecs = (specs: unknown, categoryId?: number) => {
	if (!isRecord(specs)) return getSpecTemplateByCategoryId(categoryId);
	return getSpecTemplate(specs.template) ?? getSpecTemplateByCategoryId(categoryId);
};

export const getProductSpecDisplayGroups = (specs: unknown, categoryId?: number): ProductSpecDisplayGroup[] => {
	const template = getSpecTemplateFromSpecs(specs, categoryId);
	if (!template || !isRecord(specs)) return [];

	return template.groups
		.map((group) => {
			const groupSpecs = specs[group.key];
			if (!isRecord(groupSpecs)) return { ...group, fields: [] };

			const fields = group.fields
				.map((specField) => {
					const value = groupSpecs[specField.key];
					if (typeof value !== 'string' && typeof value !== 'number') return null;
					const normalizedValue = String(value).trim();
					if (!normalizedValue) return null;
					return { ...specField, value: normalizedValue };
				})
				.filter((specField): specField is ProductSpecDisplayField => specField !== null);

			return { ...group, fields };
		})
		.filter((group) => group.fields.length > 0);
};

export const getLegacySpecEntries = (specs: unknown) => {
	if (!isRecord(specs)) return [];

	return Object.entries(specs)
		.filter(([key]) => !['template', 'template_version', 'category_id', '_meta'].includes(key))
		.filter(([, value]) => typeof value === 'string' || typeof value === 'number')
		.map(([key, value]) => ({ key, value: String(value) }));
};
