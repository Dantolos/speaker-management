import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { headers } from "next/headers";
import "../globals.css";
import Nav from "@/component/UI/Nav";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const hideNav = pathname.includes("/speaker/");

  return (
    <NextIntlClientProvider locale={locale}>
      {!hideNav && <Nav locale={locale} />}
      <div className="min-h-dvh">{children}</div>
    </NextIntlClientProvider>
  );
}
