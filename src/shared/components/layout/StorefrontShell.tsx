'use client';

import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

/**
 * Storefront chassis = `Header` (2-tier global-nav + sub-nav-frosted)
 * → page content → `Footer` on parchment.
 *
 * Two flavors:
 *  - `StorefrontFrame` is for routes with bespoke layouts that need
 *    full-bleed sections (e.g. the marketing home + alternating tiles).
 *  - `StorefrontShell` is the standard wrapper with a centered max-width
 *    container — used for cart, checkout, orders, product detail.
 */
export function StorefrontFrame({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-screen flex-col bg-canvas">
			<Header />
			<div className="flex-1">{children}</div>
			<Footer />
		</div>
	);
}

export function StorefrontShell({ children }: { children: ReactNode }) {
	return (
		<StorefrontFrame>
			<main className="mx-auto w-full max-w-[1024px] px-5 py-12">{children}</main>
		</StorefrontFrame>
	);
}
