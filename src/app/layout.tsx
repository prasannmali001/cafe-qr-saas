import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cafe & Shop QR Review Accelerator SaaS",
  description:
    "3-Tap Frictionless Customer Review Experience with AI Persona Engine, Waiter Gamification, and Smart Smart Routing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}
