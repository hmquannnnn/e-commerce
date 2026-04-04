'use client';

import { ReactNode } from 'react';
import Header from './Header';

/** Header + full-height wrapper. Dùng khi cấu trúc nội dung tùy biến (vd. trang chủ có hero). */
export function StorefrontFrame({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen">
			<Header />
			{children}
		</div>
	);
}

/** Trang storefront chuẩn: frame + main có container max-w-7xl. */
export function StorefrontShell({ children }: { children: ReactNode }) {
	return (
		<StorefrontFrame>
			<main className="container mx-auto max-w-7xl px-4 py-10">{children}</main>
		</StorefrontFrame>
	);
}
