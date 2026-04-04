import ProductDetail from '@/src/features/product/components/ProductDetail';

interface ProductDetailPageProps {
	params: Promise<{ locale: string; id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
	const { id } = await params;
	return <ProductDetail id={id} />;
}
