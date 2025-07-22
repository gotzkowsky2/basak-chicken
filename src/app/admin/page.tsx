import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";

export default function AdminDashboard() {
  const cookieStore = cookies();
  const isSuperAdmin = cookieStore.get("superadmin_auth")?.value === "1";
  if (!isSuperAdmin) {
    redirect("/admin/login");
  }

  return <AdminDashboardClient />;
} 