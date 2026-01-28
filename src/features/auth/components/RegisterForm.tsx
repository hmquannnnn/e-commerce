'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRegister } from '../api';
import { Controller, useForm } from 'react-hook-form';
import { IRegisterForm } from '../interfaces';
import { zodResolver } from '@hookform/resolvers/zod';
import { createRegisterSchema } from '../schema';
import { Input } from '@/src/shared/components/base/ui/input';
import { Button } from '@/src/shared/components/base/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/components/base/ui/select';
import Link from 'next/link';
import { useMemo } from 'react';
import useAppRouter from '@/src/shared/hooks/useAppRouter';
import { ROUTES } from '@/src/shared/constants/routes';
import { EGender } from '../enums';

const RegisterForm = () => {
	const t = useTranslations();
	const locale = useLocale();
	const router = useAppRouter();

	const { mutate: register, isPending, error } = useRegister({});

	const registerSchema = useMemo(() => createRegisterSchema(t), [t]);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<IRegisterForm>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			email: '',
			password: '',
			confirmPassword: '',
			name: '',
			phone: '',
			gender: '',
			avatar: '',
			birthday: '',
		},
	});

	const onSubmit = (data: IRegisterForm) => {
		const { confirmPassword, ...registerPayload } = data;
		register(registerPayload, {
			onSuccess: () => router.push(ROUTES.HOME),
		});
	};

	return (
		<div className="flex min-h-screen items-center justify-center px-4 py-12">
			<div className="w-full max-w-md">
				<div className="mb-8 text-center">
					<h1 className="mb-2 text-3xl font-bold">{t('common.create_account')}</h1>
					<p>{t('common.sign_up_to_get_started')}</p>
				</div>

				<div className="rounded-lg p-8 shadow-md">
					{error && (
						<div className="mb-6 rounded-md border p-3">
							<p className="text-sm">{error.message || 'An error occurred. Please try again.'}</p>
						</div>
					)}

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
						<div>
							<label htmlFor="name" className="mb-2 block text-sm font-medium">
								{t('common.name')}
							</label>
							<Controller
								name="name"
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										id="name"
										type="text"
										placeholder={t('auth.register.please_enter_your_name')}
										aria-invalid={!!errors.name}
										className="w-full"
									/>
								)}
							/>
							{errors.name && <p className="mt-1.5 text-sm">{errors.name.message}</p>}
						</div>

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
										placeholder={t('auth.register.please_enter_your_email')}
										aria-invalid={!!errors.email}
										className="w-full"
									/>
								)}
							/>
							{errors.email && <p className="mt-1.5 text-sm">{errors.email.message}</p>}
						</div>

						<div>
							<label htmlFor="phone" className="mb-2 block text-sm font-medium">
								{t('common.phone')}
							</label>
							<Controller
								name="phone"
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										id="phone"
										type="tel"
										placeholder={t('auth.register.please_enter_your_phone')}
										aria-invalid={!!errors.phone}
										className="w-full"
									/>
								)}
							/>
							{errors.phone && <p className="mt-1.5 text-sm">{errors.phone.message}</p>}
						</div>

						<div>
							<label htmlFor="gender" className="mb-2 block text-sm font-medium">
								{t('common.gender')}
							</label>
							<Controller
								name="gender"
								control={control}
								render={({ field }) => (
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger className="w-full" aria-invalid={!!errors.gender}>
											<SelectValue placeholder={t('common.select_gender')} />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value={EGender.MALE}>{t('common.male')}</SelectItem>
											<SelectItem value={EGender.FEMALE}>{t('common.female')}</SelectItem>
											<SelectItem value={EGender.OTHERS}>{t('common.others')}</SelectItem>
										</SelectContent>
									</Select>
								)}
							/>
							{errors.gender && <p className="mt-1.5 text-sm">{errors.gender.message}</p>}
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
										placeholder={t('auth.register.please_enter_your_password')}
										aria-invalid={!!errors.password}
										className="w-full"
									/>
								)}
							/>
							{errors.password && <p className="mt-1.5 text-sm">{errors.password.message}</p>}
						</div>

						<div>
							<label htmlFor="confirm-password" className="mb-2 block text-sm font-medium">
								{t('common.confirm_password')}
							</label>
							<Controller
								name="confirmPassword"
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										id="confirm-password"
										type="password"
										placeholder={t('auth.register.please_enter_your_confirm_password')}
										aria-invalid={!!errors.confirmPassword}
										className="w-full"
									/>
								)}
							/>
							{errors.confirmPassword && <p className="mt-1.5 text-sm">{errors.confirmPassword.message}</p>}
						</div>

						<Button type="submit" disabled={isPending} className="h-11 w-full text-base font-medium">
							{isPending ? 'Creating account...' : t('common.register')}
						</Button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-sm">
							{t('common.already_have_account')}{' '}
							<Link href={`/${locale}/auth/login`} className="font-medium transition-colors">
								{t('common.login')}
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RegisterForm;
