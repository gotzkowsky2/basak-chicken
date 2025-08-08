import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function EmployeeEntry() {
  const cookieStore = await cookies();
  const emp = cookieStore.get("employee_auth");
  const adm = cookieStore.get("admin_auth");

  if (!emp && !adm) {
    redirect("/employee/login");
  }

  // 인증되었으면 직원 기본 화면으로 이동
  redirect("/employee/checklist");
} 