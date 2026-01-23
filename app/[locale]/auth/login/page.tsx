import LoginForm from '@/src/features/auth/components/LoginForm';
import { getTranslations } from 'next-intl/server';

const LoginPage = async () => {
	const t = await getTranslations();

	return (
		<LoginForm />
	);
};

export default LoginPage;