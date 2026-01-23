import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
	// Match only internationalized pathnames, exclude static files and API routes
	matcher: [
		// Match all pathnames except:
		// - API routes
		// - _next (Next.js internals)
		// - _vercel (Vercel internals)
		// - files with extension (e.g. .ico, .png, .jpg)
		'/((?!api|_next|_vercel|.*\\..*).*)',
	],
};
