import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 정적 파일들은 즉시 통과 (이미지, CSS, JS, 폰트 등)
  if (pathname.includes(".") || 
      pathname.startsWith("/_next") || 
      pathname.startsWith("/static") ||
      pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }
  
  // 인증이 필요 없는 경로는 예외 처리
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/employee/login") ||
    pathname.startsWith("/employee/forgot-password") ||
    pathname.startsWith("/employee/change-password") ||
    pathname === "/employee" ||
    pathname.startsWith("/admin/login") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }
  
  const employeeAuth = request.cookies.get("employee_auth")?.value;
  const superAdminAuth = request.cookies.get("superadmin_auth")?.value;
  const adminAuth = request.cookies.get("admin_auth")?.value;

  // 관리 권한이 있으나 employee_auth가 없는 경우 동기화 발급
  if (!employeeAuth && (adminAuth || superAdminAuth)) {
    const resp = NextResponse.next();
    const isProd = process.env.NODE_ENV === 'production';
    const domain = 'crew.basak-chicken.com';
    resp.cookies.set('employee_auth', adminAuth || superAdminAuth || '', {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: isProd,
      ...(isProd ? { domain } : {}),
    });
    return resp;
  }

  if (!employeeAuth && !superAdminAuth && !adminAuth) {
    const loginUrl = new URL("/employee/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
}; 