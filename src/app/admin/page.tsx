import { redirect } from "next/navigation";

// /admin → redirect based on auth (middleware handles the actual guard)
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
