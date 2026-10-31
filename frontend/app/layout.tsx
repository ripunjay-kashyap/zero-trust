import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ZeroTrust Wiretap HUD | Real-Time Carrier Bluff Intercept",
  description: "Tactical War Room HUD for Speculative Carrier Verification and Instant Counter-Strike",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${outfit.variable}`}>
      <body className={`${outfit.className} min-h-screen bg-black text-white flex flex-col antialiased`}>
        {children}
      </body>
    </html>
  );
}
