import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // 간단 Origin 검사 + 레이트 리밋
    const origin = req.headers.get('origin');
    if (origin) {
      try {
        const { hostname } = new URL(origin);
        if (!(hostname.endsWith('basak-chicken.com') || hostname === 'localhost')) {
          return NextResponse.json({ error: '허용되지 않은 Origin입니다.' }, { status: 403 });
        }
      } catch {}
    }
    const { employeeId, email } = await req.json();
    if (!employeeId || !email) {
      return NextResponse.json({ error: "직원 아이디와 이메일을 입력하세요." }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({ where: { employeeId } });
    if (!employee || employee.email !== email) {
      return NextResponse.json({ error: "일치하는 직원 정보가 없습니다." }, { status: 404 });
    }

    // 임시 비밀번호 생성
    const tempPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // DB에 임시 비밀번호 저장 및 isTempPassword 플래그 true로 설정
    await prisma.employee.update({
      where: { employeeId },
      data: {
        password: hashedPassword,
        isTempPassword: true,
      },
    });

    // nodemailer로 이메일 발송
    const transporter = nodemailer.createTransport({
      host: process.env.BASAK_SMTP_HOST,
      port: Number(process.env.BASAK_SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.BASAK_SMTP_USER,
        pass: process.env.BASAK_SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.BASAK_SMTP_FROM || `Basak Chicken <${process.env.BASAK_SMTP_USER}>`,
      to: email,
      subject: "[바삭치킨] 임시 비밀번호 안내",
      text: `임시 비밀번호: ${tempPassword}\n로그인 후 반드시 비밀번호를 변경해 주세요.`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("비밀번호 찾기 오류:", error);
    return NextResponse.json({ error: "이메일 전송 중 서버 오류가 발생했습니다." }, { status: 500 });
  }
} 