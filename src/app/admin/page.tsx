import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";
import { PrismaClient } from "@prisma/client";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const employeeId = cookieStore.get("employee_auth")?.value;
  if (!employeeId) {
    redirect("/employee/login");
  }
  const prisma = new PrismaClient();
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee || !employee.isSuperAdmin) {
    redirect("/employee");
  }
  return <AdminDashboardClient />;
} 