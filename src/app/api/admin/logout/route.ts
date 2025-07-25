import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // superadmin_auth 쿠키를 즉시 만료시킴
  const response = new NextResponse("로그아웃 되었습니다.", { status: 200 });
  response.cookies.set("superadmin_auth", "", {
    httpOnly: true,
    path: "/",
    maxAge: -1,
    expires: new Date(0),
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    domain: "crew.basak-chicken.com",
  });
  return response;
} 