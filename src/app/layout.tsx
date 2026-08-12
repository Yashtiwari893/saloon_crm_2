import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inwante CRM | WhatsApp-First Salon Management SaaS",
  description: "Enterprise WhatsApp-first salon booking, barber schedule & customer CRM dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-slate-900 text-slate-100 min-h-screen selection:bg-rose-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
