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

    const isProd = process.env.NODE_ENV === "production";
    // 쿠키 도메인 통일: 서브도메인 포함 범위로 설정해 중복/불일치 방지
    const domain = ".crew.basak-chicken.com";
    const commonCookie = {
      httpOnly: true,
      path: "/",
      sameSite: "lax" as const,
      secure: isProd, // 운영에서는 secure 쿠키로 설정해 TLS 하에서만 전송
      ...(isProd ? { domain } : {}),
    };

    // 임시비밀번호 여부 체크
    if ((employee as any).isTempPassword) {
      const response = NextResponse.json({ redirectTo: "/employee/change-password" });
      response.cookies.set("employee_auth", employee.id, commonCookie);
      response.cookies.set("temp_pw_auth", "1", commonCookie);
      return response;
    }

    // 로그인 성공
    const response = NextResponse.json({
      success: true,
      redirectTo: (employee as any).isSuperAdmin ? "/admin" : "/employee",
    });

    response.cookies.set("employee_auth", employee.id, commonCookie);

    if ((employee as any).isSuperAdmin) {
      response.cookies.set("admin_auth", employee.id, commonCookie);
    } else {
      // 슈퍼관리자 쿠키 잔류 제거
      response.cookies.set("admin_auth", "", { ...commonCookie, maxAge: -1, expires: new Date(0) });
    }

    // 임시비밀번호 쿠키 제거
    response.cookies.set("temp_pw_auth", "", { ...commonCookie, maxAge: -1, expires: new Date(0) });

    // 호스트 전용 보안 쿠키(근본적 정리: 도메인 지정 없음, path=/, secure)
    const hostOnly: any = {
      httpOnly: true,
      path: "/",
      sameSite: "lax" as const,
      secure: isProd,
    };
    // 구 쿠키명 제거
    response.cookies.set("__Host-employee", "", { ...hostOnly, maxAge: -1, expires: new Date(0) });
    response.cookies.set("__Host-admin", "", { ...hostOnly, maxAge: -1, expires: new Date(0) });
    // 신 쿠키명 발급
    response.cookies.set("__Host-employee_auth", employee.id, hostOnly);
    if ((employee as any).isSuperAdmin) {
      response.cookies.set("__Host-admin_auth", employee.id, hostOnly);
    } else {
      response.cookies.set("__Host-admin_auth", "", { ...hostOnly, maxAge: -1, expires: new Date(0) });
    }

    return response;
  } catch (error) {
    console.error("직원 로그인 오류:", error);
    return NextResponse.json({ error: "로그인 중 오류가 발생했습니다." }, { status: 500 });
  }
} 