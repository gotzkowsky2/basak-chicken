import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // 모든 인증 쿠키를 여러 경로(path: '/', path: '/employee')로 즉시 만료시킴
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
  // path: '/'
  response.cookies.set("employee_auth", "", { ...baseOptions, path: "/", domain });
  response.cookies.set("superadmin_auth", "", { ...baseOptions, path: "/", domain });
  response.cookies.set("admin_auth", "", { ...baseOptions, path: "/", domain });
  response.cookies.set("temp_pw_auth", "", { ...baseOptions, path: "/", domain });
  // path: '/employee'
  response.cookies.set("employee_auth", "", { ...baseOptions, path: "/employee", domain });
  response.cookies.set("superadmin_auth", "", { ...baseOptions, path: "/employee", domain });
  response.cookies.set("admin_auth", "", { ...baseOptions, path: "/employee", domain });
  response.cookies.set("temp_pw_auth", "", { ...baseOptions, path: "/employee", domain });
  return response;
} 