import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { employeeId, password } = await request.json();
    if (!employeeId || !password) {
      return NextResponse.json({ error: "아이디와 비밀번호를 입력하세요." }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({ where: { employeeId } });
    if (!employee) {
      return NextResponse.json({ error: "존재하지 않는 직원 ID입니다." }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, employee.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "비밀번호가 일치하지 않습니다." }, { status: 401 });
    }

    // 임시비밀번호 여부 체크 (isTempPassword 필드가 있다고 가정)
    if ((employee as any).isTempPassword) {
      // 임시비밀번호인 경우 비밀번호 변경 페이지로 리다이렉트
      const response = NextResponse.json({ redirectTo: "/employee/change-password" });
      const isProd = process.env.NODE_ENV === "production";
      const prodDomain = "crew.basak-chicken.com";
      const domainOption = isProd ? { domain: prodDomain } : {};
      response.cookies.set("employee_auth", employee.id, {
        httpOnly: true,
        path: "/",
        sameSite: 'lax',
        secure: false, // HTTP 환경에서도 작동하도록 false로 설정
        ...domainOption
      });
      response.cookies.set("temp_pw_auth", "1", {
        httpOnly: true,
        path: "/",
        sameSite: 'lax',
        secure: false, // HTTP 환경에서도 작동하도록 false로 설정
        ...domainOption
      });
      return response;
    }

    // 로그인 성공: 쿠키 발급
    const response = NextResponse.json({
      success: true,
      redirectTo: (employee as any).isSuperAdmin ? "/admin-choose" : "/employee"
    });
    const isProd = process.env.NODE_ENV === "production";
    const prodDomain = "crew.basak-chicken.com";
    const domainOption = isProd ? { domain: prodDomain } : {};
    
    // 모든 직원에게 employee_auth 쿠키 발급
    response.cookies.set("employee_auth", employee.id, {
      httpOnly: true,
      path: "/",
      sameSite: 'lax',
      secure: false, // HTTP 환경에서도 작동하도록 false로 설정
      ...domainOption
    });
    
    // 최고 관리자인 경우 admin_auth 쿠키도 발급
    if ((employee as any).isSuperAdmin) {
      response.cookies.set("admin_auth", employee.id, {
        httpOnly: true,
        path: "/",
        sameSite: 'lax',
        secure: false, // HTTP 환경에서도 작동하도록 false로 설정
        ...domainOption
      });
    }
    // 임시비밀번호 쿠키 삭제
    response.cookies.set("temp_pw_auth", "", {
      httpOnly: true,
      path: "/",
      maxAge: -1,
      expires: new Date(0),
      sameSite: 'lax',
      secure: false, // HTTP 환경에서도 작동하도록 false로 설정
      ...domainOption
    });
    return response;
  } catch (error) {
    console.error("직원 로그인 오류:", error);
    return NextResponse.json({ error: "로그인 중 오류가 발생했습니다." }, { status: 500 });
  }
} 