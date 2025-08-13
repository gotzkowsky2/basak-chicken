import { NextRequest, NextResponse } from "next/server";

// 긴급 복구: 모든 요청을 미들웨어 검사 없이 통과시켜 500 원인을 앱/DB로 한정
export function middleware(_: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};