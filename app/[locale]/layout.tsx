import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../globals.scss';
import { ReactNode } from 'react';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import AppProvider from '@/src/core/store/AppProvider';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'UAV Shop',
	description: 'UAV Shop',
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
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
