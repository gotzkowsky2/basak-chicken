import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// 간단 레이트 리밋 및 Origin 검사
const LOGIN_WINDOW_MS = 60_000; // 1분
const LOGIN_MAX = 30; // 분당 30회(IP 기준)
const ipToLoginTimestamps: Map<string, number[]> = new Map();

function getClientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const ip = xff.split(',')[0]?.trim();
    if (ip) return ip;
  }
  // @ts-ignore
  return (request as any).ip || 'unknown';
}

function isRateLimited(request: NextRequest): boolean {
  const ip = getClientIp(request);
  const now = Date.now();
  const win = now - LOGIN_WINDOW_MS;
  const list = (ipToLoginTimestamps.get(ip) || []).filter(t => t > win);
  if (list.length >= LOGIN_MAX) {
    ipToLoginTimestamps.set(ip, list);
    return true;
  }
  list.push(now);
  ipToLoginTimestamps.set(ip, list);
  return false;
}

function isOriginAllowed(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // 앱 내 요청(SSR 등)
  try {
    const url = new URL(origin);
    const host = url.hostname;
    return host.endsWith('basak-chicken.com') || host === 'localhost';
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isOriginAllowed(request)) {
      return NextResponse.json({ error: "허용되지 않은 Origin입니다." }, { status: 403 });
    }
    if (isRateLimited(request)) {
      return NextResponse.json({ error: "요청이 너무 많습니다. 잠시 후 다시 시도하세요." }, { status: 429 });
    }
    const { employeeId, password } = await request.json();
    if (!employeeId || !password) {
      return NextResponse.json({ error: "아이디와 비밀번호를 입력하세요." }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({ where: { employeeId } });

    // 통합 에러 메시지로 사용자 열거 방지
    if (!employee || !(await bcrypt.compare(password, employee.password))) {
      return NextResponse.json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    const isProd = process.env.NODE_ENV === "production";
    const domain = "crew.basak-chicken.com";
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

    return response;
  } catch (error) {
    console.error("직원 로그인 오류:", error);
    return NextResponse.json({ error: "로그인 중 오류가 발생했습니다." }, { status: 500 });
  }
} 