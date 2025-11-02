import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations();

  return (
    <div>
      <h1>{t("hello")}</h1>
    </div>
  );
}
