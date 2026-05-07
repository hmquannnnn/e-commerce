import { ReactNode } from 'react';
import { StorefrontShell } from '@/src/shared/components/layout/StorefrontShell';

/** Cart, checkout, orders, product detail: Header + main container chuẩn. */
export default function ShopLayout({ children }: { children: ReactNode }) {
	return <StorefrontShell>{children}</StorefrontShell>;
}
