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
    pathname.startsWith("/admin/login") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }
  
  // 디버깅을 위한 로그
  console.log("Middleware processing:", pathname);
  
  const employeeAuth = request.cookies.get("employee_auth")?.value;
  const superAdminAuth = request.cookies.get("superadmin_auth")?.value;
  const adminAuth = request.cookies.get("admin_auth")?.value;
  if (!employeeAuth && !superAdminAuth && !adminAuth) {
    const loginUrl = new URL("/employee/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

// 정적 파일과 API는 제외하고 인증이 필요한 페이지만 처리
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files with extensions (images, css, js, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
}; 