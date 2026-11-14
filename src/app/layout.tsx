import "@fontsource-variable/nunito";
import "./globals.css";

import type { Metadata, Viewport } from "next";

import { Providers } from "@/components/layout/providers";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import { DEFAULT_LOCALE } from "@/lib/i18n";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "default" },
  // A private family app: keep it out of search engines.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#5b4bdb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={DEFAULT_LOCALE} className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
