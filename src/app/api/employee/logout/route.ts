import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // employee_auth 쿠키를 즉시 만료시킴
  const response = NextResponse.json({ message: "로그아웃 되었습니다." });
  response.cookies.set("employee_auth", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
} 