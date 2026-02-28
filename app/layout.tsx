import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Legani | Intelligent Hospitality",
  description: "Experience the future of boutique luxury hosting. Legani is an intelligent concierge that knows everything about your stay.",
  openGraph: {
    title: "Legani | Intelligent Hospitality",
    description: "Experience the future of boutique luxury hosting with Legani's intelligent concierge.",
    url: "https://legani.co",
    siteName: "Legani",
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/icon.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
