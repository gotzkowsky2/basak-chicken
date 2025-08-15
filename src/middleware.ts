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

  // 로그인 페이지 진입 시 잔존 세션 쿠키 강제 만료 처리
  if (pathname === "/employee/login" || pathname === "/admin/login") {
    const host = (request.headers.get("host") || "crew.basak-chicken.com").split(":")[0];
    const resp = NextResponse.next();
    resp.headers.set("Cache-Control", "no-store");
    resp.headers.set("Clear-Site-Data", '"cookies"');
    const names = [
      "employee_auth",
      "admin_auth",
      "superadmin_auth",
      "temp_pw_auth",
      "__Host-employee_auth",
      "__Host-admin_auth",
      "__Host-temp_pw_auth",
      "__Host-superadmin_auth",
      // 레거시 호스트 전용 쿠키명까지 제거
      "__Host-employee",
      "__Host-admin",
      // 안전망: 단일 언더스코어 표기까지 제거 시도
      "_Host-employee",
      "_Host-admin",
    ];
    const domainVariants: Array<string | undefined> = [
      undefined,
      host,
      `.${host}`,
      "crew.basak-chicken.com",
      ".crew.basak-chicken.com",
    ];
    const pathVariants: string[] = ["/", "/employee", "/admin", "/api"];
    const secureVariants: boolean[] = [true, false];
    const sameSiteVariants: Array<"lax" | "none" | "strict"> = ["lax", "none", "strict"];

    for (const name of names) {
      for (const d of domainVariants) {
        for (const p of pathVariants) {
          for (const s of secureVariants) {
            for (const ss of sameSiteVariants) {
              resp.cookies.set(name, "", {
                httpOnly: true,
                path: p,
                sameSite: ss,
                ...(d ? { domain: d } : {}),
                secure: s,
                expires: new Date(0),
                maxAge: 0,
              });
            }
          }
        }
      }
    }
    return resp;
  }

  if (publicPaths.has(pathname)) return NextResponse.next();

  // 인증 쿠키 확인 시 __Host-* 우선 확인
  const employeeAuth = request.cookies.get("__Host-employee_auth")?.value || request.cookies.get("employee_auth")?.value;
  const adminAuth = request.cookies.get("__Host-admin_auth")?.value || request.cookies.get("admin_auth")?.value;
  const superAdminAuth = request.cookies.get("__Host-superadmin_auth")?.value || request.cookies.get("superadmin_auth")?.value;

  // 관리자 영역 보호
  if (pathname.startsWith("/admin")) {
    if (!adminAuth && !superAdminAuth) {
      return NextResponse.redirect(new URL("/employee/login", request.url));
    }
    return NextResponse.next();
  }

  // 직원 영역 보호
  if (pathname.startsWith("/employee")) {
    // 관리자/슈퍼관리자 세션이 있으면 직원 영역 접근 허용 (헤더/메뉴 표시 보장)
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