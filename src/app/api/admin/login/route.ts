import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { employeeId, password } = await req.json();
    if (!employeeId || !password) {
      return NextResponse.json({ error: "아이디와 비밀번호를 입력하세요." }, { status: 400 });
    }
    // 최고 관리자만 인증
    const employee = await prisma.employee.findUnique({
      where: { employeeId },
    });
    if (!employee || !employee.isSuperAdmin) {
      return NextResponse.json({ error: "최고 관리자만 로그인할 수 있습니다." }, { status: 403 });
    }
    // 비밀번호 비교
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return NextResponse.json({ error: "비밀번호가 일치하지 않습니다." }, { status: 401 });
    }
    // 비밀번호 제외하고 반환
    const { password: _, ...employeeWithoutPassword } = employee;
    // httpOnly 쿠키로 인증 상태 저장 (1시간 유효)
    const response = NextResponse.json({ employee: employeeWithoutPassword });
    response.cookies.set("superadmin_auth", "1", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60, // 1시간
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: "로그인 중 오류가 발생했습니다." }, { status: 500 });
  }
} 