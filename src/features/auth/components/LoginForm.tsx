'use client';

import { useLogin } from '../api';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ILoginRequest } from '../interfaces';
import { createLoginSchema } from '../schema';
import { useTranslations, useLocale } from 'next-intl';
import { Input } from '@/src/shared/components/base/ui/input';
import { Button } from '@/src/shared/components/base/ui/button';
import Link from 'next/link';
import { useMemo } from 'react';
import useAppRouter from '@/src/shared/hooks/useAppRouter';
import { ROUTES } from '@/src/shared/constants/routes';
import { ShoppingBag, AlertCircle } from 'lucide-react';
import { useAppDispatch } from '@/src/core/store/store';
import { setAccessToken, setRefreshToken, setUser } from '@/src/core/store/auth.slice';

const LoginForm = () => {
	const { mutate: login, isPending, error } = useLogin({});
	const t = useTranslations();
	const locale = useLocale();
	const router = useAppRouter();
	const dispatch = useAppDispatch();

	const loginSchema = useMemo(() => createLoginSchema(t), [t]);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<ILoginRequest>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const onSubmit = (data: ILoginRequest) => {
		login(data, {
			onSuccess: (res) => {
				dispatch(setAccessToken(res.data.access_token));
				dispatch(setRefreshToken(res.data.refresh_token));
				dispatch(setUser(res.data.user));
				router.push(res.data.user.role === 'admin' ? ROUTES.ADMIN.PRODUCTS.LIST : ROUTES.HOME);
			},
		});
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-canvas-parchment px-5 py-16">
			<div className="w-full max-w-[420px]">
				<div className="mb-10 flex flex-col items-center text-center">
					<Link
						href={`/${locale}${ROUTES.HOME}`}
						className="text-tagline press mb-8 inline-flex items-center gap-2 text-ink"
					>
						<ShoppingBag className="h-5 w-5 text-primary" />
						UAV Store
					</Link>
					<h1 className="text-display-lg text-ink">{t('common.welcome_back')}</h1>
					<p className="text-lead mt-3 text-ink-muted-80">{t('common.sign_in_to_continue')}</p>
				</div>

				<div className="rounded-[18px] border border-hairline bg-canvas p-8">
					{error && (
						<div className="mb-6 flex items-start gap-2 rounded-[14px] border border-destructive/20 bg-destructive/10 p-3 text-destructive">
							<AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
							<p className="text-caption">{error.message || 'An error occurred. Please try again.'}</p>
						</div>
					)}

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
						<div className="space-y-2">
							<label htmlFor="email" className="text-caption-strong block text-ink">
								{t('common.email')}
							</label>
							<Controller
								name="email"
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										id="email"
										type="email"
										placeholder={t('auth.login.please_enter_your_email')}
										aria-invalid={!!errors.email}
										autoComplete="email"
									/>
								)}
							/>
							{errors.email && <p className="text-caption text-destructive">{errors.email.message}</p>}
						</div>

						<div className="space-y-2">
							<label htmlFor="password" className="text-caption-strong block text-ink">
								{t('common.password')}
							</label>
							<Controller
								name="password"
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										id="password"
										type="password"
										placeholder={t('auth.login.please_enter_your_password')}
										aria-invalid={!!errors.password}
										autoComplete="current-password"
									/>
								)}
							/>
							{errors.password && <p className="text-caption text-destructive">{errors.password.message}</p>}
						</div>

						<Button type="submit" disabled={isPending} size="lg" className="w-full">
							{isPending ? `${t('common.login')}…` : t('common.login')}
						</Button>
					</form>

					<div className="text-caption mt-6 text-center text-ink-muted-48">
						{t('common.dont_have_account')}{' '}
						<Link href={`/${locale}${ROUTES.AUTH.REGISTER}`} className="press font-medium text-primary hover:underline">
							{t('common.register')}
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginForm;
