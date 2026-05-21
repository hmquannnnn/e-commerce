import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.scss';
import { ReactNode } from 'react';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import AppProvider from '@/src/core/store/AppProvider';

/**
 * Apple-style typography is built on SF Pro Display + SF Pro Text.
 * Those faces are proprietary; on macOS/iOS Safari `system-ui` resolves
 * to the real SF. Everywhere else we ship Inter as the closest open-source
 * stand-in (per DESIGN.md §"Note on Font Substitutes"), with `system-ui`
 * + `-apple-system` as the leading stack entries so Apple devices still
 * pick up the genuine SF.
 */
const inter = Inter({
	variable: '--font-display-fallback',
	subsets: ['latin'],
	display: 'swap',
	axes: ['opsz'],
});

export const metadata: Metadata = {
	title: 'UAV Store',
	description: 'Drones engineered for the way you fly.',
};

interface ILocaleLayoutProps {
	children: ReactNode;
	params: Promise<{
		locale: string;
	}>;
}

export default async function LocaleLayout({ children, params }: ILocaleLayoutProps) {
	const { locale } = await params;
	setRequestLocale(locale);

	const messages = await getMessages();

	return (
		<html lang={locale}>
			<body className={`${inter.variable} bg-canvas text-ink antialiased`}>
				<NextIntlClientProvider locale={locale} messages={messages}>
					<AppProvider>{children}</AppProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}

export function generateStaticParams() {
	return [{ locale: 'vi' }, { locale: 'en' }];
}
