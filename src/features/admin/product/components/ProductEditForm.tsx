'use client';

import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from '@/src/shared/components/base/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/base/ui/card';
import { Input } from '@/src/shared/components/base/ui/input';
import { Textarea } from '@/src/shared/components/base/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/components/base/ui/select';
import { ICategory } from '@/src/features/product/interfaces';
import useAppRouter from '@/src/shared/hooks/useAppRouter';
import { ROUTES } from '@/src/shared/constants/routes';
import { createProductSchema, CreateProductFormValues } from '../schema';
import { useUpdateProduct } from '../api';
import { ADMIN_PRODUCT_QUERY_KEYS } from '../api/query-keys';
import { IAdminProductDetail } from '../interfaces';
import ProductSpecsField from './ProductSpecsField';
import {
	buildProductSpecsPayload,
	createEmptySpecsForTemplate,
	getSpecTemplateByCategoryId,
	specsPayloadToFormValues,
} from '@/src/features/product/specs/templates';

interface ProductEditFormProps {
	product: IAdminProductDetail;
	categories: ICategory[];
}

const ProductEditForm = ({ product, categories }: ProductEditFormProps) => {
	const t = useTranslations();
	const router = useAppRouter();
	const queryClient = useQueryClient();
	const schema = useMemo(() => createProductSchema(t), [t]);
	const updateProduct = useUpdateProduct();

	const {
		control,
		handleSubmit,
		setValue,
		clearErrors,
		formState: { errors },
	} = useForm<CreateProductFormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: product.name,
			description: product.description ?? '',
			price: String(product.price),
			category_id: product.category_id?.toString() ?? '',
			specs: specsPayloadToFormValues(product.specs, product.category_id),
		},
	});

	const onSubmit = (formData: CreateProductFormValues) => {
		const categoryId = Number(formData.category_id);
		const specs = buildProductSpecsPayload(categoryId, formData.specs);

		updateProduct.mutate(
			{
				id: product.id,
				request: {
					name: formData.name,
					description: formData.description || undefined,
					price: Number(formData.price),
					category_id: categoryId,
					specs,
				},
			},
			{
				onSuccess: () => {
					toast.success(t('admin.product.update_success'));
					queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCT_QUERY_KEYS.all });
					router.push(ROUTES.ADMIN.PRODUCTS.LIST);
				},
				onError: () => toast.error(t('admin.product.update_error')),
			}
		);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<div className="space-y-6 lg:col-span-2">
				<Card>
					<CardHeader>
						<CardTitle>{t('admin.product.basic_info')}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-5">
						<div>
							<label className="mb-1.5 block text-sm font-medium">
								{t('admin.product.name')} <span className="text-destructive">*</span>
							</label>
							<Controller
								name="name"
								control={control}
								render={({ field }) => (
									<Input {...field} placeholder={t('admin.product.name_placeholder')} aria-invalid={!!errors.name} />
								)}
							/>
							{errors.name && <p className="mt-1.5 text-sm text-destructive">{errors.name.message}</p>}
						</div>

						<div>
							<label className="mb-1.5 block text-sm font-medium">{t('admin.product.description')}</label>
							<Controller
								name="description"
								control={control}
								render={({ field }) => (
									<Textarea {...field} rows={5} placeholder={t('admin.product.description_placeholder')} />
								)}
							/>
						</div>

						<ProductSpecsField control={control} errors={errors} />
					</CardContent>
				</Card>
			</div>

			<div className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>{t('admin.product.pricing')}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-5">
						<div>
							<label className="mb-1.5 block text-sm font-medium">
								{t('admin.product.price')} <span className="text-destructive">*</span>
							</label>
							<Controller
								name="price"
								control={control}
								render={({ field }) => (
									<div className="relative">
										<span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">₫</span>
										<Input
											{...field}
											type="number"
											min={0}
											step={1000}
											placeholder="0"
											className="pl-7"
											aria-invalid={!!errors.price}
										/>
									</div>
								)}
							/>
							{errors.price && <p className="mt-1.5 text-sm text-destructive">{errors.price.message}</p>}
						</div>

						<div>
							<label className="mb-1.5 block text-sm font-medium">
								{t('admin.product.category')} <span className="text-destructive">*</span>
							</label>
							<Controller
								name="category_id"
								control={control}
								render={({ field }) => (
									<Select
										value={field.value?.toString() ?? ''}
										onValueChange={(value) => {
											field.onChange(value);
											const template = getSpecTemplateByCategoryId(value);
											setValue('specs', template ? createEmptySpecsForTemplate(template) : {}, {
												shouldDirty: true,
												shouldValidate: true,
											});
											clearErrors('specs');
										}}
									>
										<SelectTrigger aria-invalid={!!errors.category_id}>
											<SelectValue placeholder={t('admin.product.select_category')} />
										</SelectTrigger>
										<SelectContent>
											{categories.map((cat) => (
												<SelectItem key={cat.id} value={cat.id.toString()}>
													{cat.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
							{errors.category_id && <p className="mt-1.5 text-sm text-destructive">{errors.category_id.message}</p>}
						</div>
					</CardContent>
				</Card>

				<div className="flex flex-col gap-3">
					<Button type="submit" disabled={updateProduct.isPending} className="w-full">
						{updateProduct.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{t('admin.product.save_product')}
					</Button>
					<Button
						type="button"
						variant="outline"
						className="w-full"
						onClick={() => router.push(ROUTES.ADMIN.PRODUCTS.LIST)}
					>
						{t('common.cancel')}
					</Button>
				</div>
			</div>
		</form>
	);
};

export default ProductEditForm;
