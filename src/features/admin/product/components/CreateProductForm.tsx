'use client';

import { useCallback, useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Upload, X, Star, StarOff, Loader2, ImagePlus } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/src/shared/components/base/ui/button';
import { Input } from '@/src/shared/components/base/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/base/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/components/base/ui/select';
import { cn } from '@/src/shared/lib/utils';

import { createProductSchema, CreateProductFormValues } from '../schema';
import { useCreateProduct, useGenerateProductId } from '../api';
import { useImageUpload } from '../hooks/useImageUpload';
import { ICategory } from '@/src/features/product/interfaces';
import useAppRouter from '@/src/shared/hooks/useAppRouter';
import { ROUTES } from '@/src/shared/constants/routes';

interface CreateProductFormProps {
	categories: ICategory[];
}

type TranslationFn = ReturnType<typeof useTranslations>;

function renderSubmitLabel({
	isPending,
	isUploading,
	t,
}: {
	isPending: boolean;
	isUploading: boolean;
	t: TranslationFn;
}) {
	if (isPending) {
		return (
			<>
				<Loader2 className="mr-2 h-4 w-4 animate-spin" />
				{t('common.saving')}
			</>
		);
	}
	if (isUploading) {
		return (
			<>
				<Upload className="mr-2 h-4 w-4" />
				{t('admin.product.uploading_images')}
			</>
		);
	}
	return t('admin.product.create_product');
}

const CreateProductForm = ({ categories }: CreateProductFormProps) => {
	const t = useTranslations();
	const router = useAppRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const schema = useMemo(() => createProductSchema(t), [t]);

	// Pre-fetch product ID
	const { data: productIdData, isLoading: isIdLoading, isError: isIdError } = useGenerateProductId();
	const productId = productIdData?.product_id;

	const { images, addImages, removeImage, setPrimary, uploadedImages, isUploading } = useImageUpload(productId);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<CreateProductFormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: '',
			description: '',
			price: '',
			category_id: '',
			specs: '',
		},
	});

	const { mutate: createProduct, isPending } = useCreateProduct();

	const onSubmit = (formData: CreateProductFormValues) => {
		if (!productId) {
			toast.error(t('admin.product.product_id_not_ready'));
			return;
		}
		if (isUploading) {
			toast.error(t('admin.product.wait_for_upload'));
			return;
		}

		let specs: Record<string, string> | undefined;
		if (formData.specs && formData.specs.trim()) {
			try {
				specs = JSON.parse(formData.specs);
			} catch {
				toast.error(t('admin.product.specs_invalid_json'));
				return;
			}
		}

		createProduct(
			{
				product_id: productId,
				name: formData.name,
				description: formData.description || undefined,
				price: Number(formData.price),
				category_id: formData.category_id ? Number(formData.category_id) : undefined,
				specs,
				images: uploadedImages.map((img) => ({
					url: img.public_url!,
					display_order: img.display_order,
					is_primary: img.is_primary,
				})),
			},
			{
				onSuccess: (res) => {
					toast.success(t('admin.product.create_success'));
					router.push(ROUTES.ADMIN.PRODUCTS.EDIT(res.id));
				},
				onError: () => {
					toast.error(t('admin.product.create_error'));
				},
			}
		);
	};

	const handleFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const files = Array.from(e.target.files ?? []);
			if (files.length) addImages(files);
			e.target.value = '';
		},
		[addImages]
	);

	const handleDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
			if (files.length) addImages(files);
		},
		[addImages]
	);

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
			{/* Left column: basic info */}
			<div className="space-y-6 lg:col-span-2">
				<Card>
					<CardHeader>
						<CardTitle>{t('admin.product.basic_info')}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-5">
						{/* Name */}
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
							{errors.name && <p className="text-destructive mt-1.5 text-sm">{errors.name.message}</p>}
						</div>

						{/* Description */}
						<div>
							<label className="mb-1.5 block text-sm font-medium">{t('admin.product.description')}</label>
							<Controller
								name="description"
								control={control}
								render={({ field }) => (
									<textarea
										{...field}
										rows={4}
										placeholder={t('admin.product.description_placeholder')}
										className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									/>
								)}
							/>
						</div>

						{/* Specs JSON */}
						<div>
							<label className="mb-1.5 block text-sm font-medium">
								{t('admin.product.specs')}
								<span className="text-muted-foreground ml-1 text-xs">(JSON)</span>
							</label>
							<Controller
								name="specs"
								control={control}
								render={({ field }) => (
									<textarea
										{...field}
										rows={4}
										placeholder='{"weight": "1.2kg", "battery": "5000mAh"}'
										className={cn(
											'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
											errors.specs && 'border-destructive'
										)}
									/>
								)}
							/>
							{errors.specs && <p className="text-destructive mt-1.5 text-sm">{errors.specs.message}</p>}
						</div>
					</CardContent>
				</Card>

				{/* Image Upload */}
				<Card>
					<CardHeader>
						<CardTitle>{t('admin.product.images')}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{isIdLoading && (
							<div className="text-muted-foreground flex items-center gap-2 text-sm">
								<Loader2 className="h-4 w-4 animate-spin" />
								{t('admin.product.preparing_upload')}
							</div>
						)}
						{isIdError && <p className="text-destructive text-sm">{t('admin.product.product_id_error')}</p>}

						{/* Drop zone */}
						{productId && (
							<div
								onDrop={handleDrop}
								onDragOver={(e) => e.preventDefault()}
								onClick={() => fileInputRef.current?.click()}
								className="border-input hover:bg-muted/30 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 transition-colors"
							>
								<ImagePlus className="text-muted-foreground h-8 w-8" />
								<p className="text-muted-foreground text-sm font-medium">{t('admin.product.drop_or_click')}</p>
								<p className="text-muted-foreground text-xs">{t('admin.product.accepted_formats')}</p>
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									multiple
									className="hidden"
									onChange={handleFileChange}
								/>
							</div>
						)}

						{/* Image previews */}
						{images.length > 0 && (
							<div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
								{images.map((img, idx) => (
									<div key={idx} className="group relative aspect-square">
										<Image src={img.preview} alt={`preview-${idx}`} fill className="rounded-md object-cover" />

										{/* Uploading overlay */}
										{img.uploading && (
											<div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40">
												<Loader2 className="h-5 w-5 animate-spin text-white" />
											</div>
										)}

										{/* Error overlay */}
										{img.error && (
											<div className="absolute inset-0 flex items-center justify-center rounded-md bg-red-500/70">
												<p className="px-1 text-center text-xs text-white">{img.error}</p>
											</div>
										)}

										{/* Primary badge */}
										{img.is_primary && !img.uploading && (
											<span className="absolute left-1 top-1 rounded bg-yellow-400 px-1.5 py-0.5 text-xs font-semibold text-yellow-900">
												{t('admin.product.primary')}
											</span>
										)}

										{/* Actions (visible on hover) */}
										{!img.uploading && (
											<div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
												<button
													type="button"
													onClick={() => setPrimary(idx)}
													title={t('admin.product.set_primary')}
													className="rounded bg-white/80 p-1 shadow hover:bg-white"
												>
													{img.is_primary ? (
														<Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
													) : (
														<StarOff className="h-3 w-3 text-gray-500" />
													)}
												</button>
												<button
													type="button"
													onClick={() => removeImage(idx)}
													title={t('admin.product.remove_image')}
													className="rounded bg-white/80 p-1 shadow hover:bg-white"
												>
													<X className="h-3 w-3 text-red-500" />
												</button>
											</div>
										)}
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Right column: price, category, actions */}
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>{t('admin.product.pricing')}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-5">
						{/* Price */}
						<div>
							<label className="mb-1.5 block text-sm font-medium">
								{t('admin.product.price')} <span className="text-destructive">*</span>
							</label>
							<Controller
								name="price"
								control={control}
								render={({ field }) => (
									<div className="relative">
										<span className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 text-sm">₫</span>
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
							{errors.price && <p className="text-destructive mt-1.5 text-sm">{errors.price.message}</p>}
						</div>

						{/* Category */}
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

				{/* Product ID debug info */}
				{productId && (
					<Card>
						<CardContent className="pt-4">
							<p className="text-muted-foreground text-xs">
								<span className="font-medium">{t('admin.product.product_id')}:</span>
								<br />
								<code className="break-all text-xs">{productId}</code>
							</p>
						</CardContent>
					</Card>
				)}

				{/* Submit */}
				<div className="flex flex-col gap-3">
					<Button type="submit" disabled={isPending || isUploading || isIdLoading || !productId} className="w-full">
						{renderSubmitLabel({ isPending, isUploading, t })}
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

export default CreateProductForm;
