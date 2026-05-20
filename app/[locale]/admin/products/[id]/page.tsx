import { redirect } from 'next/navigation';
import { ROUTES } from '@/src/shared/constants/routes';

export default async function AdminProductDetailRedirect({
	params,
}: {
	params: Promise<{ locale: string; id: string }>;
}) {
	const { locale, id } = await params;
	redirect(`/${locale}${ROUTES.ADMIN.PRODUCTS.EDIT(id)}`);
}
