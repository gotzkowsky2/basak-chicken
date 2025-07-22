import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../../generated/prisma";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { employeeId, email } = await req.json();
    if (!employeeId || !email) {
      return NextResponse.json({ error: "아이디와 이메일을 모두 입력하세요." }, { status: 400 });
    }
    const employee = await prisma.employee.findUnique({ where: { employeeId } });
    if (!employee || !employee.email) {
      return NextResponse.json({ error: "등록된 이메일이 없는 관리자입니다. 최고 관리자에게 문의하세요." }, { status: 404 });
    }
    if (employee.email !== email) {
      return NextResponse.json({ error: "이메일이 일치하지 않습니다." }, { status: 400 });
    }
    if (!employee.isSuperAdmin) {
      return NextResponse.json({ error: "최고 관리자만 비밀번호 찾기가 가능합니다." }, { status: 403 });
    }
    // 임시 비밀번호 생성
    const tempPassword = Math.random().toString(36).slice(-10);
    const hashed = await bcrypt.hash(tempPassword, 10);
    await prisma.employee.update({
      where: { employeeId },
      data: { password: hashed },
    });
    // 이메일 발송
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
      from: process.env.BASAK_SMTP_FROM,
      to: employee.email,
      subject: "[Basak Chicken] 관리자 임시 비밀번호 안내",
      text: `임시 비밀번호: ${tempPassword}\n로그인 후 반드시 비밀번호를 변경해 주세요.`,
    });
    return NextResponse.json({ message: "임시 비밀번호가 이메일로 발송되었습니다." });
  } catch (error) {
    return NextResponse.json({ error: "비밀번호 재설정 중 오류가 발생했습니다." }, { status: 500 });
  }
} 