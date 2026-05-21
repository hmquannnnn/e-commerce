import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { Truck, ShieldCheck, RefreshCw, Boxes } from 'lucide-react';
import { Button } from '@/src/shared/components/base/ui/button';
import ProductList from '@/src/features/product/components/ProductList';

/**
 * Marketing home — Apple-style alternating hero tiles + product grid.
 *
 * Pattern (DESIGN.md §"Cards & Containers" + §"Overview"):
 *   1. light hero tile (white)         — primary headline + 2 pill CTAs
 *   2. dark product tile (#272729)     — Pro hero (one tile per product line)
 *   3. parchment product tile (#f5f5f7)— Air hero (color shift = section break)
 *   4. light value-prop strip          — 4 small chip cards (truck/shield/etc)
 *   5. light grid section              — full ProductList (catalog grid)
 *
 * Tiles are full-bleed (no horizontal padding on the tile element); the
 * inner content is centered with a max width. The colour change between
 * tiles IS the section divider — no borders, no gradients.
 */
export default async function HomePage() {
	const t = await getTranslations();
	const locale = await getLocale();

	const valueProps = [
		{ icon: Truck, label: t('product.home.free_shipping'), desc: t('product.home.free_shipping_desc') },
		{ icon: ShieldCheck, label: t('product.home.genuine_warranty'), desc: t('product.home.genuine_warranty_desc') },
		{ icon: RefreshCw, label: t('product.home.easy_returns'), desc: t('product.home.easy_returns_desc') },
		{ icon: Boxes, label: t('product.home.thousands_products'), desc: t('product.home.thousands_products_desc') },
	];

	return (
		<>
			{/* ── Tile 1: light hero ────────────────────────────────────────── */}
			<section className="bg-canvas">
				<div className="mx-auto flex max-w-[1024px] flex-col items-center px-5 py-20 text-center md:py-28">
					<p className="text-tagline text-primary">{t('product.home.hero_eyebrow')}</p>
					<h1 className="text-hero mt-2 text-ink">
						{t('product.home.hero_title_1')}
						<br />
						<span className="text-ink-muted-48">{t('product.home.hero_title_2')}</span>
					</h1>
					<p className="text-lead mt-5 max-w-2xl text-ink-muted-80">{t('product.home.hero_subtitle')}</p>
					<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
						<Button asChild size="lg">
							<Link href={`/${locale}#catalog`}>{t('product.home.hero_cta_primary')}</Link>
						</Button>
						<Button asChild variant="outline" size="lg">
							<Link href={`/${locale}#catalog`}>{t('product.home.hero_cta_secondary')}</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* ── Tile 4: value-prop strip (light) ──────────────────────────── */}
			<section className="bg-canvas">
				<div className="mx-auto max-w-[1024px] px-5 py-10">
					<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
						{valueProps.map(({ icon: Icon, label, desc }) => (
							<div key={label} className="flex flex-col items-start gap-2 rounded-[18px] bg-canvas-parchment px-5 py-5">
								<Icon className="h-5 w-5 text-primary" />
								<p className="text-body-strong text-ink">{label}</p>
								<p className="text-caption text-ink-muted-48">{desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── Tile 5: catalog grid ──────────────────────────────────────── */}
			<section id="catalog" className="bg-canvas">
				<div className="mx-auto max-w-[1024px] px-5 py-16">
					<div className="mb-10 max-w-2xl">
						<h2 className="text-display-md text-ink">{t('product.home.featured_products')}</h2>
						<p className="text-lead mt-2 text-ink-muted-80">{t('product.home.featured_subtitle')}</p>
					</div>
					<ProductList />
				</div>
			</section>
		</>
	);
}
