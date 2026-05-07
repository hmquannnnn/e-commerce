import { z } from 'zod';

type TranslationFunction = (key: string) => string;

export const createProductSchema = (t: TranslationFunction) =>
	z.object({
		name: z.string().nonempty(t('admin.product.name_required')).max(50, t('admin.product.name_max_50')),
		description: z.string().optional(),
		price: z
			.string()
			.nonempty(t('admin.product.price_required'))
			.refine((v) => !isNaN(Number(v)) && Number(v) >= 0, {
				message: t('admin.product.price_invalid'),
			}),
		category_id: z.string().optional(),
		specs: z
			.string()
			.optional()
			.refine(
				(v) => {
					if (!v || v.trim() === '') return true;
					try {
						JSON.parse(v);
						return true;
					} catch {
						return false;
					}
				},
				{ message: t('admin.product.specs_invalid_json') }
			),
	});

export type CreateProductFormValues = z.infer<ReturnType<typeof createProductSchema>>;
