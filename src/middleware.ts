import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 공개 경로
  const publicPaths = new Set<string>([
    "/",
    "/employee/login",
    "/employee/forgot-password",
    "/employee/change-password",
    "/admin/login",
  ]);
  if (publicPaths.has(pathname)) return NextResponse.next();

  const employeeAuth = request.cookies.get("employee_auth")?.value;
  const adminAuth = request.cookies.get("admin_auth")?.value;
  const superAdminAuth = request.cookies.get("superadmin_auth")?.value;

  // 관리자 영역 보호
  if (pathname.startsWith("/admin")) {
    if (!adminAuth && !superAdminAuth) {
      return NextResponse.redirect(new URL("/employee/login", request.url));
    }
    return NextResponse.next();
  }

  // 직원 영역 보호
  if (pathname.startsWith("/employee")) {
    if (!employeeAuth && !adminAuth && !superAdminAuth) {
      return NextResponse.redirect(new URL("/employee/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  // 정적/이미지/파비콘/확장자 파일은 제외 → 라우트 페이지만 검사
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};