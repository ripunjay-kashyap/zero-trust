import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
