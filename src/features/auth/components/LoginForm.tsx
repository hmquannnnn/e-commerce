'use client';

import { useLogin } from "../api";
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ILoginRequest } from "../interfaces";
import { createLoginSchema } from "../schema";
import { useTranslations, useLocale } from "next-intl";
import { Input } from "@/src/shared/components/base/ui/input";
import { Button } from "@/src/shared/components/base/ui/button";
import Link from "next/link";
import { useMemo } from "react";
import useAppRouter from "@/src/shared/hooks/useAppRouter";
import { ROUTES } from "@/src/shared/constants/routes";

const LoginForm = () => {
	const { mutate: login, isPending, error } = useLogin({});
	const t = useTranslations();
	const locale = useLocale();
	const router = useAppRouter();

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
			onSuccess: () => router.push(ROUTES.HOME),
		});
	};

	return (
		<div className="min-h-screen flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold mb-2">
						{t('common.welcome_back')}
					</h1>
					<p>
						{t('common.sign_in_to_continue')}
					</p>
				</div>

				<div className="rounded-lg shadow-md p-8">
					{error && (
						<div className="mb-6 p-3 rounded-md border">
							<p className="text-sm">
								{error.message || 'An error occurred. Please try again.'}
							</p>
						</div>
					)}

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
						<div>
							<label htmlFor="email" className="block text-sm font-medium mb-2">
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
							{errors.email && (
								<p className="mt-1.5 text-sm">
									{errors.email.message}
								</p>
							)}
						</div>

						<div>
							<label htmlFor="password" className="block text-sm font-medium mb-2">
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
							{errors.password && (
								<p className="mt-1.5 text-sm">
									{errors.password.message}
								</p>
							)}
						</div>

						<Button
							type="submit"
							disabled={isPending}
							className="w-full h-11 text-base font-medium"
						>
							{isPending ? 'Signing in...' : t('common.login')}
						</Button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-sm">
							{t('common.dont_have_account')}{' '}
							<Link
								href={`/${locale}/auth/register`}
								className="font-medium transition-colors"
							>
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