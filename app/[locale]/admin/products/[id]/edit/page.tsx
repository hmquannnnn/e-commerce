import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { initializeApiClientInstance } from '@/src/core/api';
import { IApiResponse } from '@/src/core/api/interface';
import ProductEditForm from '@/src/features/admin/product/components/ProductEditForm';
import { IAdminProductDetail } from '@/src/features/admin/product/interfaces';
import { ICategory } from '@/src/features/product/interfaces';
import { ROUTES } from '@/src/shared/constants/routes';

// Admin pages are auth-gated and data-driven — never prerender at build time
// (the API is unreachable during `next build`, which hangs the export).
export const dynamic = 'force-dynamic';

async function getProduct(id: string): Promise<IAdminProductDetail | null> {
	try {
		const apiClient = initializeApiClientInstance({ includeAuthHeader: false });
		return await apiClient.get<IApiResponse<IAdminProductDetail>>(`/products/${id}`).then((res) => res.data.data);
	} catch {
		return null;
	}
}

async function getCategories(): Promise<ICategory[]> {
	try {
		const apiClient = initializeApiClientInstance({ includeAuthHeader: false });
		return await apiClient.get<IApiResponse<ICategory[]>>('/categories').then((res) => res.data.data);
	} catch {
		return [];
	}
}

export default async function EditProductPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
	const { locale, id } = await params;
	const t = await getTranslations();
	const [product, categories] = await Promise.all([getProduct(id), getCategories()]);

	return (
		<div className="space-y-6">
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
				<h1 className="text-2xl font-bold tracking-tight">{t('admin.product.edit_product')}</h1>
				<p className="mt-1 text-sm text-muted-foreground">{product?.name ?? id}</p>
			</div>

			{product ? (
				<ProductEditForm product={product} categories={categories} />
			) : (
				<div className="flex flex-col items-center justify-center gap-3 rounded-xl border py-16">
					<AlertCircle className="h-12 w-12 text-destructive" />
					<p className="text-muted-foreground">{t('admin.product.product_not_found')}</p>
				</div>
			)}
		</div>
	);
}
