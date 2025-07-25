import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // 인증이 필요 없는 경로(정적 파일, 로그인, 회원가입, 비밀번호 찾기 등)는 예외 처리
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/employee/login") ||
    pathname.startsWith("/employee/forgot-password") ||
    pathname.startsWith("/employee/change-password") ||
    pathname.startsWith("/admin/login") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }
  const employeeAuth = request.cookies.get("employee_auth")?.value;
  const superAdminAuth = request.cookies.get("superadmin_auth")?.value;
  const adminAuth = request.cookies.get("admin_auth")?.value;
  if (!employeeAuth && !superAdminAuth && !adminAuth) {
    const loginUrl = new URL("/employee/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
}; 