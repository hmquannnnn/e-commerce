import { z } from 'zod';

type TranslationFunction = (key: string) => string;

export const createCategorySchema = (t: TranslationFunction) =>
	z.object({
		name: z.string().nonempty(t('admin.category.name_required')).max(255, t('admin.category.name_max')),
		description: z.string().optional(),
	});

export type CategoryFormValues = z.infer<ReturnType<typeof createCategorySchema>>;
