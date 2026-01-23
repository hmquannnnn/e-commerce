import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

const useAppRouter = () => {
	const locale = useLocale();
	const router = useRouter();

	const push = useCallback((path: string) => {
		router.push(`/${locale}${path}`);
	}, [locale, router]);

	return {
		push,
	};
};

export default useAppRouter;