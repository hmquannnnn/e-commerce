'use client';

import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

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
