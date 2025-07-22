import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "비밀번호는 6자 이상이어야 합니다." }, { status: 400 });
    }
    // 인증 쿠키에서 직원 ID 추출
    const employeeId = req.cookies.get("employee_auth")?.value;
    if (!employeeId) {
      return NextResponse.json({ error: "인증 정보가 없습니다. 다시 로그인해 주세요." }, { status: 401 });
    }
    // 직원 정보 조회
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
      return NextResponse.json({ error: "직원 정보를 찾을 수 없습니다." }, { status: 404 });
    }
    // 비밀번호 해시 저장
    const hashed = await bcrypt.hash(password, 10);
    await prisma.employee.update({
      where: { id: employeeId },
      data: { password: hashed },
    });
    // 쿠키 갱신: temp_pw_auth 삭제, employee_auth 갱신
    const response = NextResponse.json({ message: "비밀번호가 성공적으로 변경되었습니다." });
    response.cookies.set("temp_pw_auth", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    response.cookies.set("employee_auth", employeeId, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: "비밀번호 변경 중 오류가 발생했습니다." }, { status: 500 });
  }
} 