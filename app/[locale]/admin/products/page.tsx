import { initializeApiClientInstance } from '@/src/core/api';
import { IApiResponse } from '@/src/core/api/interface';
import AdminProductsListPage from '@/src/features/admin/product/components/AdminProductsListPage';
import { ICategory } from '@/src/features/product/interfaces';

// Admin pages are auth-gated and data-driven — never prerender at build time
// (the API is unreachable during `next build`, which hangs the export).
export const dynamic = 'force-dynamic';

async function getCategories(): Promise<ICategory[]> {
	try {
		const apiClient = initializeApiClientInstance({ includeAuthHeader: false });
		return await apiClient.get<IApiResponse<ICategory[]>>('/categories').then((res) => res.data.data);
	} catch {
		return [];
	}
}

export default async function AdminProductsPage() {
	const categories = await getCategories();
	return <AdminProductsListPage categories={categories} />;
}
