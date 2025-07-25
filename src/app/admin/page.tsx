import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";
import { PrismaClient } from "@prisma/client";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const employeeId = cookieStore.get("employee_auth")?.value;
  const superAdminId = cookieStore.get("superadmin_auth")?.value;
  const adminId = cookieStore.get("admin_auth")?.value;
  // 모든 인증 쿠키가 없으면 로그인 페이지로
  if (!employeeId && !superAdminId && !adminId) {
    redirect("/employee/login");
  }
  // superadmin_auth가 있으면 슈퍼관리자 체크
  if (superAdminId) {
    const prisma = new PrismaClient();
    const employee = await prisma.employee.findUnique({ where: { id: superAdminId } });
    if (!employee || !employee.isSuperAdmin) {
      redirect("/employee");
    }
  }
  return <AdminDashboardClient />;
} 