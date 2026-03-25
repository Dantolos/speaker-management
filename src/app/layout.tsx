//import { NextIntlClientProvider } from "next-intl";
import type { Metadata } from "next";
type Props = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "L3L MGMT",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/site.webmanifest",
};

export default async function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="L3L MGMT" />
      </head>
      <body>{children}</body>
    </html>
  );
}
