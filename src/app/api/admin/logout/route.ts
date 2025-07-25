import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // nodejs 런타임 강제

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ message: "로그아웃 되었습니다." });
  const isProd = process.env.NODE_ENV === "production";
  const baseOptions = {
    httpOnly: true,
    maxAge: -1,
    expires: new Date(0),
    sameSite: 'lax' as const,
    ...(isProd ? { secure: true } : {}),
  };
  const domain = "crew.basak-chicken.com";
  const domainOption = isProd ? { domain } : {};

  response.cookies.set("admin_auth", "", { ...baseOptions, path: "/", ...domainOption });
  response.cookies.set("superadmin_auth", "", { ...baseOptions, path: "/", ...domainOption });
  response.cookies.set("employee_auth", "", { ...baseOptions, path: "/", ...domainOption });
  response.cookies.set("temp_pw_auth", "", { ...baseOptions, path: "/", ...domainOption });

  return response;
} 