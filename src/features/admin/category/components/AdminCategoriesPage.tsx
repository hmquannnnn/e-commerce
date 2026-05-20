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
			<tr className="hover:bg-muted/30 transition-colors">
				<td className="px-4 py-3 align-top">
					<Input value={name} onChange={(e) => setName(e.target.value)} aria-label={t('admin.category.name')} />
				</td>
				<td className="px-4 py-3 align-top">
					<Input
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						aria-label={t('admin.category.description')}
					/>
				</td>
				<td className="text-muted-foreground px-4 py-3 align-top text-sm tabular-nums">{category.id}</td>
				<td className="px-4 py-3 align-top">
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
		<tr className="hover:bg-muted/30 transition-colors">
			<td className="px-4 py-3 font-medium">{category.name}</td>
			<td className="text-muted-foreground px-4 py-3">{category.description || t('admin.category.no_description')}</td>
			<td className="text-muted-foreground px-4 py-3 text-sm tabular-nums">{category.id}</td>
			<td className="px-4 py-3">
				<div className="flex justify-end gap-2">
					<Button
						size="icon-sm"
						variant="outline"
						onClick={() => setIsEditing(true)}
						aria-label={t('admin.category.edit')}
					>
						<Pencil className="h-4 w-4" />
					</Button>
					<Button
						size="icon-sm"
						variant="destructive"
						onClick={handleDelete}
						disabled={deleteCategory.isPending}
						aria-label={t('admin.category.delete')}
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
						<Skeleton key={i} className="h-14 w-full rounded-xl" />
					))}
				</div>
			);
		}

		if (isError || !data) {
			return (
				<div className="flex flex-col items-center justify-center gap-4 py-16">
					<AlertCircle className="text-destructive h-12 w-12" />
					<p className="text-muted-foreground">{t('admin.category.load_error')}</p>
					<Button variant="outline" onClick={() => refetch()} className="gap-2">
						<RefreshCw className="h-4 w-4" />
						{t('common.retry')}
					</Button>
				</div>
			);
		}

		if (data.length === 0) {
			return <p className="text-muted-foreground py-12 text-center">{t('admin.category.empty')}</p>;
		}

		return (
			<div className="overflow-x-auto rounded-xl border">
				<table className="w-full text-sm">
					<thead className="bg-muted/50 text-muted-foreground">
						<tr>
							<th className="px-4 py-3 text-left font-medium">{t('admin.category.name')}</th>
							<th className="px-4 py-3 text-left font-medium">{t('admin.category.description')}</th>
							<th className="px-4 py-3 text-left font-medium">{t('admin.category.id')}</th>
							<th className="px-4 py-3 text-right font-medium">{t('admin.category.actions')}</th>
						</tr>
					</thead>
					<tbody className="divide-y">
						{data.map((category) => (
							<CategoryRow key={category.id} category={category} />
						))}
					</tbody>
				</table>
			</div>
		);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<FolderTree className="h-6 w-6" />
				<h1 className="text-2xl font-bold">{t('admin.category.categories')}</h1>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border p-4">
				<div className="grid gap-3 md:grid-cols-[minmax(180px,1fr)_minmax(240px,2fr)_auto]">
					<div>
						<Controller
							name="name"
							control={control}
							render={({ field }) => (
								<Input {...field} placeholder={t('admin.category.name_placeholder')} aria-invalid={!!errors.name} />
							)}
						/>
						{errors.name && <p className="text-destructive mt-1.5 text-sm">{errors.name.message}</p>}
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
