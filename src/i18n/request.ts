import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) || "vi";

  let messages: Record<string, unknown>;
  try {
    messages = (await import(`./translations/${locale}/index`)).default;
  } catch {
    messages = (await import(`./translations/vi/index`)).default;
  }

  return {
    locale,
    messages,
  };
});
