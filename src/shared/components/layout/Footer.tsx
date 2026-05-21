'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ROUTES } from '@/src/shared/constants/routes';

/**
 * Apple-style footer per DESIGN.md §"Footer":
 *
 *  - Background: parchment (#f5f5f7).
 *  - Link columns at `dense-link` typography (17px / 400 / 2.41 line-height
 *    — the relaxed leading makes dense columns scannable).
 *  - Column headings at `caption-strong` (14px / 600).
 *  - Legal row at `fine-print` (12px / 400) in `ink-muted-48`.
 *  - Vertical padding 64px.
 */
const Footer = () => {
	const t = useTranslations();
	const locale = useLocale();

	const columns = [
		{
			title: t('footer.shop_and_learn'),
			links: [
				{ label: t('common.products'), href: `/${locale}${ROUTES.HOME}` },
				{ label: t('cart.title'), href: `/${locale}${ROUTES.CART}` },
				{ label: t('order.nav_orders'), href: `/${locale}${ROUTES.ORDERS.LIST}` },
			],
		},
		{
			title: t('footer.account'),
			links: [
				{ label: t('common.login'), href: `/${locale}${ROUTES.AUTH.LOGIN}` },
				{ label: t('common.register'), href: `/${locale}${ROUTES.AUTH.REGISTER}` },
			],
		},
		{
			title: t('footer.about_uav_store'),
			links: [
				{ label: t('footer.contact_us'), href: '#' },
				{ label: t('footer.warranty'), href: '#' },
				{ label: t('footer.privacy'), href: '#' },
			],
		},
	];

	return (
		<footer className="mt-auto w-full bg-canvas-parchment text-ink-muted-80">
			<div className="mx-auto max-w-[1024px] px-5 py-16">
				<div className="grid gap-10 md:grid-cols-3">
					{columns.map((col) => (
						<div key={col.title}>
							<p className="text-caption-strong mb-1 text-ink">{col.title}</p>
							<ul>
								{col.links.map((link) => (
									<li key={link.label}>
										<Link
											href={link.href}
											className="text-[12px] leading-[2.4] tracking-[-0.01em] text-ink-muted-80 hover:text-ink"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				<div className="text-fine mt-12 flex flex-col gap-3 border-t border-hairline/70 pt-6 md:flex-row md:items-center md:justify-between">
					<p className="text-ink-muted-48">{t('footer.legal_copyright', { year: new Date().getFullYear() })}</p>
					<p className="text-ink-muted-48">{t('footer.legal_tagline')}</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
