import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import EmployeeMainClient from "./EmployeeMainClient";

export default function EmployeeMain() {
  const cookieStore = cookies();
  const isEmployee = !!cookieStore.get("employee_auth")?.value;
  if (!isEmployee) {
    redirect("/employee/login");
  }
  return <EmployeeMainClient />;
} 