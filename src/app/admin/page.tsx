import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminEntry() {
  const cookieStore = await cookies();
  const adm = cookieStore.get("admin_auth");
  const emp = cookieStore.get("employee_auth");

  if (!adm && !emp) {
    redirect("/employee/login");
  }

  redirect("/admin/checklists");
} 