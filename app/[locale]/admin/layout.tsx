'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/src/core/store/store';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ROUTES } from '@/src/shared/constants/routes';
import { Loader2 } from 'lucide-react';
import { Toaster } from '@/src/shared/components/base/ui/sonner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const user = useAppSelector((s) => s.auth.user);
	const router = useRouter();
	const locale = useLocale();

	useEffect(() => {
		if (user !== undefined && user !== null && user.role !== 'admin') {
			router.replace(`/${locale}${ROUTES.HOME}`);
		}
		if (user === null) {
			router.replace(`/${locale}${ROUTES.AUTH.LOGIN}`);
		}
	}, [user, router, locale]);

	// Show nothing while auth state resolves
	if (user === undefined) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-6 w-6 animate-spin" />
			</div>
		);
	}

	if (!user || user.role !== 'admin') return null;

	return (
		<>
			<div className="min-h-screen">
				<nav className="border-b px-6 py-3">
					<div className="mx-auto flex max-w-7xl items-center gap-6">
						<span className="text-sm font-semibold">Admin</span>
						<a
							href={`/${locale}${ROUTES.ADMIN.PRODUCTS.LIST}`}
							className="text-muted-foreground hover:text-foreground text-sm transition-colors"
						>
							Products
						</a>
					</div>
				</nav>
				<main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
			</div>
			<Toaster richColors />
		</>
	);
}
