import { ReactNode } from 'react';
import { StorefrontShell } from '@/src/shared/components/layout/StorefrontShell';

export default function ShopLayout({ children }: { children: ReactNode }) {
	return <StorefrontShell>{children}</StorefrontShell>;
}
