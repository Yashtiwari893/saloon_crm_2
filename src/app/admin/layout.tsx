// Plain admin root layout — no sidebar, no header.
// Only /admin/login lives here directly.
// Protected admin pages live in /admin/(protected)/ which has its own layout with AdminSidebar.
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-slate-950 text-slate-100">{children}</div>;
}
