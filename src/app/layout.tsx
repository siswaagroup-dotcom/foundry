import type { Metadata } from "next";

import { AppProviders } from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Foundry",
  description: "The all-in-one business operating system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
