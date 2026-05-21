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
import { cn } from '@/src/shared/lib/utils';
import { ICategory } from '@/src/features/product/interfaces';
import useAppRouter from '@/src/shared/hooks/useAppRouter';
import { ROUTES } from '@/src/shared/constants/routes';
import { createProductSchema, CreateProductFormValues } from '../schema';
import { useUpdateProduct } from '../api';
import { ADMIN_PRODUCT_QUERY_KEYS } from '../api/query-keys';
import { IAdminProductDetail } from '../interfaces';

interface ProductEditFormProps {
	product: IAdminProductDetail;
	categories: ICategory[];
}

const stringifySpecs = (specs?: Record<string, unknown>) => {
	if (!specs || Object.keys(specs).length === 0) return '';
	return JSON.stringify(specs, null, 2);
};

const ProductEditForm = ({ product, categories }: ProductEditFormProps) => {
	const t = useTranslations();
	const router = useAppRouter();
	const queryClient = useQueryClient();
	const schema = useMemo(() => createProductSchema(t), [t]);
	const updateProduct = useUpdateProduct();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<CreateProductFormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: product.name,
			description: product.description ?? '',
			price: String(product.price),
			category_id: product.category_id?.toString() ?? '',
			specs: stringifySpecs(product.specs),
		},
	});

	const onSubmit = (formData: CreateProductFormValues) => {
		let specs: Record<string, string> | undefined;
		if (formData.specs && formData.specs.trim()) {
			try {
				specs = JSON.parse(formData.specs);
			} catch {
				toast.error(t('admin.product.specs_invalid_json'));
				return;
			}
		}

		updateProduct.mutate(
			{
				id: product.id,
				request: {
					name: formData.name,
					description: formData.description || undefined,
					price: Number(formData.price),
					category_id: formData.category_id ? Number(formData.category_id) : undefined,
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

						<div>
							<label className="mb-1.5 block text-sm font-medium">
								{t('admin.product.specs')}
								<span className="ml-1 text-xs text-muted-foreground">(JSON)</span>
							</label>
							<Controller
								name="specs"
								control={control}
								render={({ field }) => (
									<Textarea
										{...field}
										rows={7}
										placeholder='{"weight": "1.2kg", "battery": "5000mAh"}'
										className={cn('min-h-[160px] font-mono text-[14px]', errors.specs && 'border-destructive')}
									/>
								)}
							/>
							{errors.specs && <p className="mt-1.5 text-sm text-destructive">{errors.specs.message}</p>}
						</div>
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
							<label className="mb-1.5 block text-sm font-medium">{t('admin.product.category')}</label>
							<Controller
								name="category_id"
								control={control}
								render={({ field }) => (
									<Select value={field.value?.toString() ?? ''} onValueChange={field.onChange}>
										<SelectTrigger>
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
