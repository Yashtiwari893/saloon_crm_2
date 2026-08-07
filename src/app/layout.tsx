import "./globals.css";
import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Velvet Cut | WhatsApp-First Salon Management SaaS",
  description: "Enterprise WhatsApp-first salon booking, barber schedule & customer CRM dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-slate-900 text-slate-100 min-h-screen flex selection:bg-rose-500 selection:text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          <Header />
          <main className="flex-1 p-6 overflow-y-auto bg-slate-950/60">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
