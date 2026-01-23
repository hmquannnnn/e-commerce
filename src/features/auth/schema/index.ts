import { z } from 'zod';
import { EGender, ERole } from '../enums';

type TranslationFunction = (key: string) => string;

export const createLoginSchema = (t: TranslationFunction) => {
	return z.object({
		email: z
			.string()
			.nonempty(t('auth.login.email_is_required'))
			.email(t('auth.login.invalid_email_format')),
		password: z
			.string()
			.nonempty(t('auth.login.password_is_required'))
			.min(8, t('auth.login.password_must_be_at_least_8_characters_long'))
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/,
				t('auth.login.invalid_password_format')
			),
	});
};

export const createRegisterSchema = (t: TranslationFunction) => {
	return z.object({
		email: z
			.string()
			.nonempty(t('auth.login.email_is_required'))
			.email(t('auth.login.invalid_email_format')),
		password: z
			.string()
			.nonempty(t('auth.login.password_is_required'))
			.min(8, t('auth.login.password_must_be_at_least_8_characters_long'))
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/,
				t('auth.login.invalid_password_format')
			),
		confirmPassword: z
			.string()
			.nonempty(t('auth.register.confirm_password_is_required')),
		name: z
			.string()
			.nonempty(t('auth.register.name_is_required'))
			.min(3, t('auth.register.name_must_be_at_least_3_characters_long')),
		phone: z
			.string()
			.nonempty(t('auth.register.phone_is_required'))
			.min(10, t('auth.register.phone_must_be_at_least_10_characters_long')),
		avatar: z
			.string()
			.optional(),
		birthday: z
			.string()
			.optional(),
    gender: z.string().nonempty(t('auth.register.gender_is_required')),
	}).refine((data) => data.password === data.confirmPassword, {
		message: t('auth.register.passwords_do_not_match'),
		path: ["confirmPassword"],
	});
};


