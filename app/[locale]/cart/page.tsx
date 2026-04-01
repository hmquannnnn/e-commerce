import CartPage from '@/src/features/cart/components/CartPage';
import Header from '@/src/shared/components/layout/Header';

export default function CartRoute() {
	return (
		<div className="min-h-screen">
			<Header />
			<main className="container mx-auto max-w-7xl px-4 py-10">
				<CartPage />
			</main>
		</div>
	);
}
