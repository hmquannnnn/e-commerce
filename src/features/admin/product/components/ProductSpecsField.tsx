'use client';

import { Control, Controller, FieldErrors, Path, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { Input } from '@/src/shared/components/base/ui/input';
import { getSpecTemplateByCategoryId } from '@/src/features/product/specs/templates';

import { CreateProductFormValues } from '../schema';

interface ProductSpecsFieldProps {
	control: Control<CreateProductFormValues>;
	errors: FieldErrors<CreateProductFormValues>;
}

const toInputValue = (value: unknown) => {
	if (typeof value === 'string' || typeof value === 'number') return value;
	return '';
};

const ProductSpecsField = ({ control, errors }: ProductSpecsFieldProps) => {
	const t = useTranslations();
	const categoryId = useWatch({ control, name: 'category_id' });
	const template = getSpecTemplateByCategoryId(categoryId);

	if (!template) {
		return (
			<div className="space-y-3">
				<label className="block text-sm font-medium">{t('admin.product.specs')}</label>
				<div className="rounded-md border border-dashed border-input px-4 py-5 text-sm text-muted-foreground">
					{t('admin.product.select_category_for_specs')}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<label className="block text-sm font-medium">{t('admin.product.specs')}</label>
				<span className="text-xs text-muted-foreground">{t(template.labelKey)}</span>
			</div>

			<div className="space-y-5">
				{template.groups.map((group) => (
					<div key={group.key} className="rounded-lg border border-input p-4">
						<h3 className="mb-3 text-sm font-semibold">{t(group.labelKey)}</h3>
						<div className="grid gap-3 sm:grid-cols-2">
							{group.fields.map((specField) => {
								const fieldPath = `specs.${group.key}.${specField.key}` as Path<CreateProductFormValues>;
								const specError = errors.specs?.[group.key]?.[specField.key];

								return (
									<div key={specField.key}>
										<div className="mb-1.5 flex items-center gap-2">
											<label className="text-sm font-medium">{t(specField.labelKey)}</label>
											<span className="text-xs text-muted-foreground">
												{specField.required ? t('admin.product.required') : t('admin.product.optional')}
											</span>
										</div>
										<Controller
											name={fieldPath}
											control={control}
											render={({ field }) => (
												<Input
													{...field}
													value={toInputValue(field.value)}
													placeholder={t('admin.product.spec_value_placeholder')}
													aria-invalid={!!specError}
												/>
											)}
										/>
										{specError?.message && <p className="mt-1.5 text-sm text-destructive">{specError.message}</p>}
									</div>
								);
							})}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ProductSpecsField;
