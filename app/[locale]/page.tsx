import { getTranslations } from 'next-intl/server';
import { Truck, Shield, RefreshCw, ShoppingBag } from 'lucide-react';
import Header from '@/src/shared/components/layout/Header';
import ProductList from '@/src/features/product/components/ProductList';

export default async function HomePage() {
	const t = await getTranslations();

	const features = [
		{ icon: Truck, label: t('product.home.free_shipping'), desc: t('product.home.free_shipping_desc') },
		{ icon: Shield, label: t('product.home.genuine_warranty'), desc: t('product.home.genuine_warranty_desc') },
		{ icon: RefreshCw, label: t('product.home.easy_returns'), desc: t('product.home.easy_returns_desc') },
		{ icon: ShoppingBag, label: t('product.home.thousands_products'), desc: t('product.home.thousands_products_desc') },
	];

	return (
		<div className="min-h-screen">
			<Header />

			{/* Hero section */}
			<section className="from-primary/10 via-background to-background bg-gradient-to-b px-4 py-16 text-center">
				<div className="mx-auto max-w-2xl">
					<h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
						{t('product.home.hero_title_1')} <span className="text-primary">{t('product.home.hero_title_2')}</span>
					</h1>
					<p className="text-muted-foreground text-lg">{t('product.home.hero_subtitle')}</p>
				</div>
			</section>

			{/* Feature highlights */}
			<section className="bg-muted/40 border-y">
				<div className="container mx-auto max-w-7xl px-4 py-6">
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
						{features.map(({ icon: Icon, label, desc }) => (
							<div key={label} className="flex flex-col items-center gap-1.5 text-center sm:flex-row sm:text-left">
								<div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
									<Icon className="text-primary h-5 w-5" />
								</div>
								<div>
									<p className="text-sm font-semibold">{label}</p>
									<p className="text-muted-foreground text-xs">{desc}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Products section */}
			<main className="container mx-auto max-w-7xl px-4 py-10">
				<h2 className="mb-6 text-2xl font-bold">{t('product.home.featured_products')}</h2>
				<ProductList />
			</main>
		</div>
	);
}
