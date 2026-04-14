import type { Metadata } from "next";
import "./globals.css";
import { AudioProvider } from "./components/AudioContext";
import StyledJsxRegistry from "./registry";

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
    <html lang="en">
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
