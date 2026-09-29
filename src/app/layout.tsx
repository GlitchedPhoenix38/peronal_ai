import type { Metadata } from "next";
import { GeistMono, GeistSans } from "geist/font";
import "./globals.css";

export const metadata: Metadata = {
  title: "Relay AI Workspace",
  description: "A unified AI workspace for provider routing, shared memory, usage control, and secure API key management."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
