import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ManualClient from "./ManualClient";

export default async function ManualPage() {
  const cookieStore = await cookies();
  const isEmployee = !!cookieStore.get("employee_auth")?.value;
  const isTempPw = cookieStore.get("temp_pw_auth")?.value === "1";
  
  if (!isEmployee) {
    redirect("/employee/login");
  }
  if (isTempPw) {
    redirect("/employee/change-password");
  }
  
  return <ManualClient />;
} 