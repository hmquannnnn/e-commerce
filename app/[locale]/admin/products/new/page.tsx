import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { initializeApiClientInstance } from '@/src/core/api';
import { IApiResponse } from '@/src/core/api/interface';
import { ICategory } from '@/src/features/product/interfaces';
import CreateProductForm from '@/src/features/admin/product/components/CreateProductForm';
import { ROUTES } from '@/src/shared/constants/routes';

async function getCategories(): Promise<ICategory[]> {
	try {
		const apiClient = initializeApiClientInstance({ includeAuthHeader: false });
		return await apiClient.get<IApiResponse<ICategory[]>>('/categories').then((res) => res.data.data);
	} catch {
		return [];
	}
}

export default async function NewProductPage({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	const t = await getTranslations();
	const categories = await getCategories();

	return (
		<div className="space-y-6">
			{/* Breadcrumb */}
			<div className="flex items-center gap-3">
				<Link
					href={`/${locale}${ROUTES.ADMIN.PRODUCTS.LIST}`}
					className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					<ArrowLeft className="h-4 w-4" />
					{t('admin.product.back_to_products')}
				</Link>
			</div>

			<div>
				<h1 className="text-2xl font-bold tracking-tight">{t('admin.product.new_product')}</h1>
				<p className="mt-1 text-sm text-muted-foreground">{t('admin.product.create_product')}</p>
			</div>

			<CreateProductForm categories={categories} />
		</div>
	);
}
