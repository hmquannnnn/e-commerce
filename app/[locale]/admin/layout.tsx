'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/src/core/store/store';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ROUTES } from '@/src/shared/constants/routes';
import { Loader2, LogOut, ShoppingBag, User } from 'lucide-react';
import { Toaster } from '@/src/shared/components/base/ui/sonner';
import { cn } from '@/src/shared/lib/utils';
import { clearAuth } from '@/src/core/store/auth.slice';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/src/shared/components/base/ui/dropdown-menu';

/**
 * Admin chassis — pure-black 44px global-nav + parchment frosted sub-nav.
 * Mirrors the storefront chrome but swaps the sub-nav links for admin
 * sections (products / categories / orders). The page body sits on the
 * canvas surface with consistent 5xl max-width.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const user = useAppSelector((s) => s.auth.user);
	const dispatch = useAppDispatch();
	const router = useRouter();
	const pathname = usePathname();
	const locale = useLocale();
	const t = useTranslations();

	const handleLogout = () => {
		dispatch(clearAuth());
		router.replace(`/${locale}${ROUTES.AUTH.LOGIN}`);
	};

	useEffect(() => {
		if (user !== undefined && user !== null && user.role !== 'admin') {
			router.replace(`/${locale}${ROUTES.HOME}`);
		}
		if (user === null) {
			router.replace(`/${locale}${ROUTES.AUTH.LOGIN}`);
		}
	}, [user, router, locale]);

	if (user === undefined) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-canvas-parchment">
				<Loader2 className="h-6 w-6 animate-spin text-primary" />
			</div>
		);
	}

	if (!user || user.role !== 'admin') return null;

	const isActive = (path: string) => {
		const localizedPath = `/${locale}${path}`;
		return pathname === localizedPath || pathname.startsWith(`${localizedPath}/`);
	};

	const adminLinks = [
		{ href: ROUTES.ADMIN.PRODUCTS.LIST, label: t('admin.product.products') },
		{ href: ROUTES.ADMIN.CATEGORIES.LIST, label: t('admin.category.categories') },
		{ href: ROUTES.ADMIN.ORDERS.LIST, label: t('admin.order.orders') },
	];

	return (
		<div className="flex min-h-screen flex-col bg-canvas">
			{/* ── Single header ───────────────────────────────────────────────── */}
			<nav className="frost sticky top-0 z-50 w-full border-b border-hairline/60">
				<div className="mx-auto flex h-[52px] max-w-[1280px] items-center justify-between px-5">
					{/* Brand */}
					<Link
						href={`/${locale}${ROUTES.ADMIN.PRODUCTS.LIST}`}
						className="text-tagline press inline-flex items-center gap-1.5 text-ink"
					>
						<ShoppingBag className="h-4 w-4" />
						UAV Store · {t('common.admin')}
					</Link>

					{/* Admin nav links */}
					<div className="flex items-center gap-1">
						{adminLinks.map((link) => (
							<Link
								key={link.href}
								href={`/${locale}${link.href}`}
								className={cn(
									'press inline-flex h-9 items-center rounded-full px-3.5 text-[14px] tracking-[-0.014em]',
									isActive(link.href) ? 'bg-ink text-white' : 'text-ink-muted-80 hover:text-ink'
								)}
							>
								{link.label}
							</Link>
						))}
					</div>

					{/* User dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button
								className={cn(
									'press text-caption inline-flex h-8 items-center gap-1.5 rounded-full',
									'border border-hairline bg-canvas px-3 text-ink outline-none hover:bg-canvas-parchment'
								)}
							>
								<User className="h-3.5 w-3.5" />
								<span className="hidden max-w-[120px] truncate sm:inline">{user.name ?? user.email}</span>
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="min-w-[180px]">
							<DropdownMenuLabel className="text-ink-muted-48">{user.email}</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={handleLogout}
								className="cursor-pointer text-destructive focus:text-destructive"
							>
								<LogOut className="h-4 w-4" />
								{t('common.logout')}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</nav>

			<main className="mx-auto w-full max-w-[1280px] flex-1 px-5 py-12">{children}</main>

			<Toaster richColors />
		</div>
	);
}
