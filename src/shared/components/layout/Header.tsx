'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ShoppingBag, ShoppingCart, User, LogOut } from 'lucide-react';
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

	return (
		<header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
			<div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
				{/* Logo */}
				<Link href={`/${locale}`} className="flex items-center gap-2">
					<div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
						<ShoppingBag className="text-primary-foreground h-5 w-5" />
					</div>
					<span className="text-xl font-bold tracking-tight">ShopNow</span>
				</Link>

				{/* Nav */}
				<nav className="hidden items-center gap-6 md:flex">
					<Link
						href={`/${locale}`}
						className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
					>
						{t('common.home')}
					</Link>
					<Link
						href={`/${locale}`}
						className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
					>
						{t('common.products')}
					</Link>
				</nav>

				{/* Auth actions */}
				<div className="flex items-center gap-2">
					{/* Cart icon */}
					<Button variant="ghost" size="icon" className="relative" asChild>
						<Link href={`/${locale}${ROUTES.CART}`} aria-label={t('cart.title')}>
							<ShoppingCart className="h-5 w-5" />
							{isAuthenticated && cartCount > 0 && (
								<span className="bg-primary text-primary-foreground absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold tabular-nums">
									{cartCount > 99 ? '99+' : cartCount}
								</span>
							)}
						</Link>
					</Button>
					{isAuthenticated ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="sm" className="gap-2">
									<User className="h-4 w-4" />
									<span className="hidden max-w-[120px] truncate sm:inline">{user?.name ?? user?.email}</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-48">
								<DropdownMenuLabel className="font-normal">
									<p className="truncate text-sm font-medium">{user?.name}</p>
									<p className="text-muted-foreground truncate text-xs">{user?.email}</p>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer gap-2">
									<LogOut className="h-4 w-4" />
									{t('common.logout')}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<>
							<Button variant="ghost" size="sm" asChild>
								<Link href={`/${locale}${ROUTES.AUTH.LOGIN}`}>{t('common.login')}</Link>
							</Button>
							<Button size="sm" asChild>
								<Link href={`/${locale}${ROUTES.AUTH.REGISTER}`}>{t('common.register')}</Link>
							</Button>
						</>
					)}
				</div>
			</div>
		</header>
	);
};

export default Header;
