import type { Metadata } from "next";
import { Inter, Playfair_Display, Frank_Ruhl_Libre } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "./components/AudioContext";
import StyledJsxRegistry from "./registry";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const hebrew = Frank_Ruhl_Libre({
  weight: ["300", "400", "500", "700"],
  subsets: ["hebrew"],
  variable: "--font-hebrew",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Legani | Pen of the Heart",
  description: "A place for your soul to gather itself. Experience the ancient words anew.",
  icons: {
    icon: "/icon.png"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${hebrew.variable}`}>
      <body>
        <StyledJsxRegistry>
          <AudioProvider>
            {children}
          </AudioProvider>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
