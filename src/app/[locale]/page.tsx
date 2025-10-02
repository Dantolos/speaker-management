import { getTranslations } from "next-intl/server";

export default async function Homepage({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage" });

  return <div>{t("title")}</div>;
}
