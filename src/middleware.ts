import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

const internalRoutes = ["/speaker", "/events", "/hotels"];

const localeRegex = new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`);

function resolveLocale(pathname: string): {
  locale: string;
  stripped: string;
  hadLocalePrefix: boolean;
} {
  const match = pathname.match(localeRegex);
  if (match) {
    return {
      locale: match[1],
      stripped: pathname.replace(localeRegex, "") || "/",
      hadLocalePrefix: true,
    };
  }
  return {
    locale: routing.defaultLocale,
    stripped: pathname,
    hadLocalePrefix: false,
  };
}

function isSpeakerDossier(path: string): boolean {
  const match = path.match(/^\/speaker\/([^/]+)$/);
  if (!match) return false;
  if (match[1] === "list") return false;
  return true;
}

function buildRedirect(
  request: NextRequest,
  locale: string,
  targetPath: string,
  redirectParam: string,
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${targetPath}`;
  url.searchParams.set("redirect", redirectParam);
  return NextResponse.redirect(url);
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { locale, stripped, hadLocalePrefix } = resolveLocale(pathname);

  // Für den redirect-Parameter nutzen wir immer eine Version MIT Locale,
  // damit der User nach Login/Access auf die Seite mit korrektem Locale zurück kommt
  const redirectTarget = hadLocalePrefix ? pathname : `/${locale}${pathname}`;

  // 1) Speaker-Dossier → Speaker- oder Internal-Cookie
  if (isSpeakerDossier(stripped)) {
    const speakerCookie = request.cookies.get("_auth_speaker");
    const internalCookie = request.cookies.get("_auth_internal");

    if (!speakerCookie && !internalCookie) {
      return buildRedirect(request, locale, "/speaker-access", redirectTarget);
    }
  }
  // 2) Interne Routen → Internal-Cookie
  else if (
    internalRoutes.some(
      (r) => stripped === r || stripped.startsWith(`${r}/`),
    ) ||
    stripped === "/"
  ) {
    const internalCookie = request.cookies.get("_auth_internal");
    if (!internalCookie) {
      return buildRedirect(request, locale, "/sign-in", redirectTarget);
    }
  }

  const response = intlMiddleware(request) as NextResponse;
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
