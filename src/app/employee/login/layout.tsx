import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";

export default async function EmployeeLoginLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const employeeId = cookieStore.get("employee_auth")?.value;
  if (employeeId) {
    const prisma = new PrismaClient();
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (employee?.isSuperAdmin) {
      redirect("/admin-choose");
    } else {
      redirect("/employee");
    }
  }
  return <>{children}</>;
} 