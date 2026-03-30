import Header from '@/src/shared/components/layout/Header';
import ProductDetail from '@/src/features/product/components/ProductDetail';

interface ProductDetailPageProps {
	params: Promise<{ locale: string; id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
	const { id } = await params;

	return (
		<div className="min-h-screen">
			<Header />
			<main className="container mx-auto max-w-7xl px-4 py-10">
				<ProductDetail id={id} />
			</main>
		</div>
	);
}
