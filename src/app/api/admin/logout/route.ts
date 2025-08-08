import { NextRequest } from "next/server";

export const runtime = "nodejs"; // nodejs 런타임 강제

export async function POST(req: NextRequest) {
  const headers = new Headers({
    "Cache-Control": "no-store",
    "Clear-Site-Data": '"cookies"',
    "Content-Type": "application/json; charset=utf-8",
  });

  const expires = "Thu, 01 Jan 1970 00:00:00 GMT";
  const names = ["employee_auth", "admin_auth", "superadmin_auth", "temp_pw_auth"];

  for (const name of names) {
    headers.append("Set-Cookie", `${name}=; Path=/; Expires=${expires}; HttpOnly; SameSite=Lax`);
    headers.append("Set-Cookie", `${name}=; Path=/employee; Expires=${expires}; HttpOnly; SameSite=Lax`);
    headers.append("Set-Cookie", `${name}=; Path=/admin; Expires=${expires}; HttpOnly; SameSite=Lax`);
  }

  const domains = ["crew.basak-chicken.com", ".crew.basak-chicken.com"];
  for (const d of domains) {
    for (const name of names) {
      headers.append("Set-Cookie", `${name}=; Path=/; Domain=${d}; Expires=${expires}; HttpOnly; SameSite=Lax`);
      headers.append("Set-Cookie", `${name}=; Path=/employee; Domain=${d}; Expires=${expires}; HttpOnly; SameSite=Lax`);
      headers.append("Set-Cookie", `${name}=; Path=/admin; Domain=${d}; Expires=${expires}; HttpOnly; SameSite=Lax`);
    }
  }

  const body = JSON.stringify({ message: "로그아웃 되었습니다." });
  return new Response(body, { status: 200, headers });
} 