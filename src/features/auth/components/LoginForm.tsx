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
import { ShoppingBag } from 'lucide-react';
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
				router.push(ROUTES.HOME);
			},
		});
	};

	return (
		<div className="flex min-h-screen items-center justify-center px-4 py-12">
			<div className="w-full max-w-md">
				<div className="mb-8 flex flex-col items-center text-center">
					<Link href={`/${locale}`} className="mb-6 flex items-center gap-2">
						<div className="bg-primary flex h-9 w-9 items-center justify-center rounded-lg">
							<ShoppingBag className="text-primary-foreground h-5 w-5" />
						</div>
						<span className="text-2xl font-bold tracking-tight">ShopNow</span>
					</Link>
					<h1 className="mb-2 text-3xl font-bold">{t('common.welcome_back')}</h1>
					<p className="text-muted-foreground">{t('common.sign_in_to_continue')}</p>
				</div>

				<div className="rounded-lg p-8 shadow-md">
					{error && (
						<div className="mb-6 rounded-md border p-3">
							<p className="text-sm">{error.message || 'An error occurred. Please try again.'}</p>
						</div>
					)}

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
						<div>
							<label htmlFor="email" className="mb-2 block text-sm font-medium">
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
										className="w-full"
									/>
								)}
							/>
							{errors.email && <p className="mt-1.5 text-sm">{errors.email.message}</p>}
						</div>

						<div>
							<label htmlFor="password" className="mb-2 block text-sm font-medium">
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
										className="w-full"
									/>
								)}
							/>
							{errors.password && <p className="mt-1.5 text-sm">{errors.password.message}</p>}
						</div>

						<Button type="submit" disabled={isPending} className="h-11 w-full text-base font-medium">
							{isPending ? 'Signing in...' : t('common.login')}
						</Button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-sm">
							{t('common.dont_have_account')}{' '}
							<Link href={`/${locale}/auth/register`} className="font-medium transition-colors">
								{t('common.register')}
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginForm;
