import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SuppliesClient from "./SuppliesClient";

export default async function SuppliesPage() {
  const cookieStore = await cookies();
  const isEmployee = !!cookieStore.get("employee_auth")?.value;
  const isTempPw = cookieStore.get("temp_pw_auth")?.value === "1";
  
  if (!isEmployee) {
    redirect("/employee/login");
  }
  if (isTempPw) {
    redirect("/employee/change-password");
  }
  
  return <SuppliesClient />;
} 