'use client';

import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertCircle, Check, FolderTree, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';

import { Button } from '@/src/shared/components/base/ui/button';
import { Input } from '@/src/shared/components/base/ui/input';
import { Skeleton } from '@/src/shared/components/base/ui/skeleton';
import { createCategorySchema, CategoryFormValues } from '../schema';
import { useAdminCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from '../api';
import { ADMIN_CATEGORY_QUERY_KEYS } from '../api/query-keys';
import { IAdminCategory } from '../interfaces';

interface CategoryRowProps {
	category: IAdminCategory;
}

const CategoryRow = ({ category }: CategoryRowProps) => {
	const t = useTranslations();
	const queryClient = useQueryClient();
	const [isEditing, setIsEditing] = useState(false);
	const [name, setName] = useState(category.name);
	const [description, setDescription] = useState(category.description ?? '');
	const updateCategory = useUpdateCategory();
	const deleteCategory = useDeleteCategory();

	const invalidateCategories = () => {
		queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORY_QUERY_KEYS.all });
	};

	const resetEdit = () => {
		setName(category.name);
		setDescription(category.description ?? '');
		setIsEditing(false);
	};

	const handleSave = () => {
		const trimmedName = name.trim();
		if (!trimmedName) {
			toast.error(t('admin.category.name_required'));
			return;
		}

		updateCategory.mutate(
			{
				id: category.id,
				request: {
					name: trimmedName,
					description: description.trim() || undefined,
				},
			},
			{
				onSuccess: () => {
					toast.success(t('admin.category.update_success'));
					invalidateCategories();
					setIsEditing(false);
				},
				onError: () => toast.error(t('admin.category.update_error')),
			}
		);
	};

	const handleDelete = () => {
		if (!window.confirm(t('admin.category.delete_confirm'))) return;
		deleteCategory.mutate(category.id, {
			onSuccess: () => {
				toast.success(t('admin.category.delete_success'));
				invalidateCategories();
			},
			onError: () => toast.error(t('admin.category.delete_error')),
		});
	};

	if (isEditing) {
		return (
			<tr className="transition-colors hover:bg-canvas-parchment/40">
				<td className="px-5 py-3 align-top">
					<Input
						value={name}
						onChange={(e) => setName(e.target.value)}
						aria-label={t('admin.category.name')}
						className="h-9 px-4 text-[14px]"
					/>
				</td>
				<td className="px-5 py-3 align-top">
					<Input
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						aria-label={t('admin.category.description')}
						className="h-9 px-4 text-[14px]"
					/>
				</td>
				<td className="text-caption px-5 py-3 align-top text-ink-muted-48 tabular-nums">{category.id}</td>
				<td className="px-5 py-3 align-top">
					<div className="flex justify-end gap-2">
						<Button
							size="icon-sm"
							onClick={handleSave}
							disabled={updateCategory.isPending}
							aria-label={t('common.save')}
						>
							<Check className="h-4 w-4" />
						</Button>
						<Button size="icon-sm" variant="ghost" onClick={resetEdit} aria-label={t('common.cancel')}>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</td>
			</tr>
		);
	}

	return (
		<tr className="transition-colors hover:bg-canvas-parchment/40">
			<td className="text-body-strong px-5 py-4 text-ink">{category.name}</td>
			<td className="text-caption px-5 py-4 text-ink-muted-80">
				{category.description || t('admin.category.no_description')}
			</td>
			<td className="text-caption px-5 py-4 text-ink-muted-48 tabular-nums">{category.id}</td>
			<td className="px-5 py-4">
				<div className="flex justify-end gap-2">
					<Button
						size="icon-sm"
						variant="secondary"
						onClick={() => setIsEditing(true)}
						aria-label={t('admin.category.edit')}
					>
						<Pencil className="h-4 w-4" />
					</Button>
					<Button
						size="icon-sm"
						variant="ghost"
						onClick={handleDelete}
						disabled={deleteCategory.isPending}
						aria-label={t('admin.category.delete')}
						className="text-ink-muted-48 hover:text-destructive"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			</td>
		</tr>
	);
};

const AdminCategoriesPage = () => {
	const t = useTranslations();
	const queryClient = useQueryClient();
	const schema = useMemo(() => createCategorySchema(t), [t]);
	const { data, isLoading, isError, refetch } = useAdminCategories();
	const createCategory = useCreateCategory();

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CategoryFormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: '',
			description: '',
		},
	});

	const onSubmit = (values: CategoryFormValues) => {
		createCategory.mutate(
			{
				name: values.name.trim(),
				description: values.description?.trim() || undefined,
			},
			{
				onSuccess: () => {
					toast.success(t('admin.category.create_success'));
					reset();
					queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORY_QUERY_KEYS.all });
				},
				onError: () => toast.error(t('admin.category.create_error')),
			}
		);
	};

	const renderTable = () => {
		if (isLoading) {
			return (
				<div className="space-y-3">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-14 w-full rounded-[14px]" />
					))}
				</div>
			);
		}

		if (isError || !data) {
			return (
				<div className="flex flex-col items-center justify-center gap-4 py-16">
					<AlertCircle className="h-12 w-12 text-destructive" />
					<p className="text-lead text-ink-muted-80">{t('admin.category.load_error')}</p>
					<Button variant="outline" onClick={() => refetch()} className="gap-2">
						<RefreshCw className="h-4 w-4" />
						{t('common.retry')}
					</Button>
				</div>
			);
		}

		if (data.length === 0) {
			return (
				<div className="flex flex-col items-center justify-center gap-3 rounded-[18px] bg-canvas-parchment py-20">
					<FolderTree className="h-12 w-12 text-ink-muted-48/40" />
					<p className="text-lead text-ink-muted-80">{t('admin.category.empty')}</p>
				</div>
			);
		}

		return (
			<div className="overflow-x-auto rounded-[18px] border border-hairline">
				<table className="w-full text-sm">
					<thead className="text-caption-strong bg-canvas-parchment text-ink-muted-80">
						<tr>
							<th className="px-5 py-3 text-left">{t('admin.category.name')}</th>
							<th className="px-5 py-3 text-left">{t('admin.category.description')}</th>
							<th className="px-5 py-3 text-left">{t('admin.category.id')}</th>
							<th className="px-5 py-3 text-right">{t('admin.category.actions')}</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-hairline">
						{data.map((category) => (
							<CategoryRow key={category.id} category={category} />
						))}
					</tbody>
				</table>
			</div>
		);
	};

	return (
		<div className="space-y-8">
			<div className="space-y-2">
				<p className="text-tagline inline-flex items-center gap-2 text-primary">
					<FolderTree className="h-4 w-4" />
					{t('admin.category.categories')}
				</p>
				<h1 className="text-display-lg text-ink">{t('admin.category.categories')}</h1>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="rounded-[18px] bg-canvas-parchment p-5 md:p-6">
				<p className="text-body-strong mb-4 text-ink">{t('admin.category.create_category')}</p>
				<div className="grid gap-3 md:grid-cols-[minmax(180px,1fr)_minmax(240px,2fr)_auto]">
					<div>
						<Controller
							name="name"
							control={control}
							render={({ field }) => (
								<Input {...field} placeholder={t('admin.category.name_placeholder')} aria-invalid={!!errors.name} />
							)}
						/>
						{errors.name && <p className="text-caption mt-1.5 text-destructive">{errors.name.message}</p>}
					</div>
					<Controller
						name="description"
						control={control}
						render={({ field }) => <Input {...field} placeholder={t('admin.category.description_placeholder')} />}
					/>
					<Button type="submit" disabled={createCategory.isPending} className="gap-2">
						<Plus className="h-4 w-4" />
						{t('admin.category.create_category')}
					</Button>
				</div>
			</form>

			{renderTable()}
		</div>
	);
};

export default AdminCategoriesPage;
