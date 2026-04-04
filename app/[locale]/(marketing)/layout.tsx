import { ReactNode } from 'react';
import { StorefrontFrame } from '@/src/shared/components/layout/StorefrontShell';

/** Trang chủ: Header + nội dung tùy biến (hero, sections) — không bọc toàn bộ trong một main chung. */
export default function MarketingLayout({ children }: { children: ReactNode }) {
	return <StorefrontFrame>{children}</StorefrontFrame>;
}
