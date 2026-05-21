'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Search, ShoppingBag, User, LogOut, Package } from 'lucide-react';
import { Button } from '@/src/shared/components/base/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/src/shared/components/base/ui/dropdown-menu';
import { useAppDispatch, useAppSelector } from '@/src/core/store/store';
import { clearAuth } from '@/src/core/store/auth.slice';
import useAppRouter from '@/src/shared/hooks/useAppRouter';
import { ROUTES } from '@/src/shared/constants/routes';
import { useCart } from '@/src/features/cart/api';
import { cn } from '@/src/shared/lib/utils';

/**
 * 2-tier navigation per DESIGN.md:
 *
 *  1. `global-nav`        — pure-black 44px bar across the top with quiet
 *                            12px / -0.12px tracking links. Always pinned.
 *  2. `sub-nav-frosted`   — 52px frosted-parchment strip directly below it,
 *                            carrying the page-level title + a primary CTA.
 *
 * The two stack and act as the page chrome on every storefront route. Auth
 * pages (login/register) and admin pages get their own simplified version,
 * so this lives only inside the storefront shell.
 */
const Header = () => {
	const t = useTranslations();
	const locale = useLocale();
	const router = useAppRouter();
	const dispatch = useAppDispatch();
	const accessToken = useAppSelector((state) => state.auth.accessToken);
	const user = useAppSelector((state) => state.auth.user);
	const isAuthenticated = !!accessToken;
	const { data: cart } = useCart();
	const cartCount = cart?.total_quantity ?? 0;

	const handleLogout = () => {
		dispatch(clearAuth());
		router.push(ROUTES.AUTH.LOGIN);
	};

	const navLinkClass = 'text-nav-link text-body-muted-on-dark hover:text-white press';

	return (
		<>
			{/* ── Tier 1: global-nav ──────────────────────────────────────────── */}
			<nav className="sticky top-0 z-50 w-full bg-surface-black">
				<div className="mx-auto flex h-11 max-w-[1024px] items-center justify-between px-5">
					<Link
						href={`/${locale}${ROUTES.HOME}`}
						className="flex items-center gap-1.5 text-[14px] font-medium tracking-tight text-body-on-dark"
					>
						<ShoppingBag className="h-4 w-4" />
						<span>UAV Store</span>
					</Link>

					<div className="hidden items-center gap-7 md:flex">
						<Link href={`/${locale}${ROUTES.HOME}`} className={navLinkClass}>
							{t('common.home')}
						</Link>
						<Link href={`/${locale}${ROUTES.HOME}`} className={navLinkClass}>
							{t('common.products')}
						</Link>
						{isAuthenticated && (
							<Link href={`/${locale}${ROUTES.ORDERS.LIST}`} className={navLinkClass}>
								{t('order.nav_orders')}
							</Link>
						)}
					</div>

					<div className="flex items-center gap-1.5">
						<Link
							aria-label={t('common.search')}
							href={`/${locale}${ROUTES.HOME}`}
							className="press inline-flex h-8 w-8 items-center justify-center text-body-muted-on-dark hover:text-white"
						>
							<Search className="h-3.5 w-3.5" />
						</Link>
						<Link
							aria-label={t('cart.title')}
							href={`/${locale}${ROUTES.CART}`}
							className="press relative inline-flex h-8 w-8 items-center justify-center text-body-muted-on-dark hover:text-white"
						>
							<ShoppingBag className="h-3.5 w-3.5" />
							{isAuthenticated && cartCount > 0 && (
								<span className="absolute -top-0.5 -right-0.5 inline-flex min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-[14px] font-medium text-white tabular-nums">
									{cartCount > 99 ? '99+' : cartCount}
								</span>
							)}
						</Link>
					</div>
				</div>
			</nav>

			{/* ── Tier 2: sub-nav-frosted ─────────────────────────────────────── */}
			<div className="frost sticky top-11 z-40 w-full border-b border-hairline/60">
				<div className="mx-auto flex h-[52px] max-w-[1024px] items-center justify-between px-5">
					<Link href={`/${locale}${ROUTES.HOME}`} className="text-tagline press text-ink">
						UAV Store
					</Link>

					<div className="flex items-center gap-2 md:gap-4">
						<Link
							href={`/${locale}${ROUTES.HOME}`}
							className="text-caption press hidden text-ink-muted-80 hover:text-ink md:inline"
						>
							{t('common.products')}
						</Link>
						{isAuthenticated && (
							<Link
								href={`/${locale}${ROUTES.ORDERS.LIST}`}
								className="text-caption press hidden text-ink-muted-80 hover:text-ink md:inline"
							>
								{t('order.nav_orders')}
							</Link>
						)}

						{isAuthenticated ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button
										className={cn(
											'press text-caption inline-flex h-8 items-center gap-1.5 rounded-full',
											'border border-hairline bg-canvas px-3 text-ink hover:bg-canvas-parchment'
										)}
									>
										<User className="h-3.5 w-3.5" />
										<span className="hidden max-w-[120px] truncate sm:inline">{user?.name ?? user?.email}</span>
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-52 rounded-[14px]">
									<DropdownMenuLabel className="px-2 py-2 font-normal">
										<p className="text-body-strong truncate text-ink">{user?.name}</p>
										<p className="text-caption truncate text-ink-muted-48">{user?.email}</p>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild>
										<Link
											href={`/${locale}${ROUTES.ORDERS.LIST}`}
											className="text-caption flex cursor-pointer items-center gap-2"
										>
											<Package className="h-4 w-4" />
											{t('order.nav_orders')}
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={handleLogout}
										className="text-caption flex cursor-pointer items-center gap-2 text-destructive"
									>
										<LogOut className="h-4 w-4" />
										{t('common.logout')}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<>
								<Button asChild variant="ghost" size="xs">
									<Link href={`/${locale}${ROUTES.AUTH.LOGIN}`}>{t('common.login')}</Link>
								</Button>
								<Button asChild variant="default" size="xs">
									<Link href={`/${locale}${ROUTES.AUTH.REGISTER}`}>{t('common.register')}</Link>
								</Button>
							</>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default Header;
