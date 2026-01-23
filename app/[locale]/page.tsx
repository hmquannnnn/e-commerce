import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations();

  return (
    <div>
      <h1>Home Page</h1>
    </div>
  );
}
