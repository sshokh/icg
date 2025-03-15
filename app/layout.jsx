import { siteConfig } from "../config";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./../styles/globals.css";
import clsx from "clsx";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning lang="en" className="dark">
      <head />
      <body
        className={clsx(
          "min-h-screen antialiased dark text-foreground bg-background",
          inter.className
        )}
      >
        <Providers>
          <div className="relative flex flex-col min-h-screen">
            <main className="container flex justify-center mx-auto max-w-7xl px-6 flex-grow">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
