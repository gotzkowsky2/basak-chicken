import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // 간단 Origin 검사
    const origin = req.headers.get('origin');
    if (origin) {
      try {
        const { hostname } = new URL(origin);
        if (!(hostname.endsWith('basak-chicken.com') || hostname === 'localhost')) {
          return NextResponse.json({ error: '허용되지 않은 Origin입니다.' }, { status: 403 });
        }
      } catch {}
    }
    const { password } = await req.json();
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "새 비밀번호는 6자 이상이어야 합니다." }, { status: 400 });
    }

    // employee_auth 쿠키로 직원 인증
    const employeeAuth = req.cookies.get("employee_auth")?.value;
    if (!employeeAuth) {
      return NextResponse.json({ error: "인증 정보가 없습니다. 다시 로그인해 주세요." }, { status: 401 });
    }

    const employee = await prisma.employee.findUnique({ where: { id: employeeAuth } });
    if (!employee) {
      return NextResponse.json({ error: "직원 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.employee.update({
      where: { id: employeeAuth },
      data: {
        password: hashedPassword,
        isTempPassword: false,
      },
    });

    // temp_pw_auth 쿠키 만료
    const response = NextResponse.json({ success: true });
    const isProd = process.env.NODE_ENV === "production";
    const domain = "crew.basak-chicken.com";
    const domainOption = isProd ? { domain } : {};
    response.cookies.set("temp_pw_auth", "", {
      httpOnly: true,
      path: "/",
      maxAge: -1,
      expires: new Date(0),
      sameSite: 'lax',
      secure: isProd ? true : false,
      ...domainOption
    });
    return response;
  } catch (error) {
    console.error("비밀번호 변경 오류:", error);
    return NextResponse.json({ error: "비밀번호 변경 중 서버 오류가 발생했습니다." }, { status: 500 });
  }
} 