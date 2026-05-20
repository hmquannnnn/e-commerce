import { z } from 'zod';
import type { useTranslations } from 'next-intl';
import { getRequiredSpecFieldsByCategoryId, getSpecTemplateByCategoryId } from '@/src/features/product/specs/templates';

type TranslationFunction = ReturnType<typeof useTranslations>;

export const createProductSchema = (t: TranslationFunction) =>
	z
		.object({
			name: z.string().nonempty(t('admin.product.name_required')).max(50, t('admin.product.name_max_50')),
			description: z.string().optional(),
			price: z
				.string()
				.nonempty(t('admin.product.price_required'))
				.refine((v) => !isNaN(Number(v)) && Number(v) >= 0, {
					message: t('admin.product.price_invalid'),
				}),
			category_id: z.string().nonempty(t('admin.product.category_required')),
			specs: z.record(z.string(), z.record(z.string(), z.string())),
		})
		.superRefine((data, ctx) => {
			const template = getSpecTemplateByCategoryId(data.category_id);
			if (!template) {
				ctx.addIssue({
					code: 'custom',
					message: t('admin.product.spec_template_required'),
					path: ['category_id'],
				});
				return;
			}

			getRequiredSpecFieldsByCategoryId(data.category_id).forEach(({ group, field }) => {
				const value = data.specs[group.key]?.[field.key]?.trim();
				if (!value) {
					ctx.addIssue({
						code: 'custom',
						message: t('admin.product.spec_field_required'),
						path: ['specs', group.key, field.key],
					});
				}
			});
		});

export type CreateProductFormValues = z.infer<ReturnType<typeof createProductSchema>>;
