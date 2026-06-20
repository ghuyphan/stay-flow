import type { Metadata } from "next";
import { LanguageProvider } from "@/components/language-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://stayflow.example"),
  title: { default: "StayFlow | Hourly and overnight rooms", template: "%s | StayFlow" },
  description: "Discover short-stay rooms and book hourly, overnight, or daily with clear pricing.",
  openGraph: {
    title: "StayFlow",
    description: "Hourly and overnight rooms, simply booked.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
