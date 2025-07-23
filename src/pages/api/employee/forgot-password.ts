import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    const { employeeId, email } = req.body;
    if (!employeeId || !email) {
      return res.status(400).json({ error: "아이디와 이메일을 모두 입력하세요." });
    }
    const employee = await prisma.employee.findUnique({ where: { employeeId } });
    if (!employee || !employee.email) {
      return res.status(404).json({ error: "등록된 이메일이 없는 직원입니다. 관리자에게 문의하세요." });
    }
    if (employee.email !== email) {
      return res.status(400).json({ error: "이메일이 일치하지 않습니다." });
    }
    // 임시 비밀번호 생성
    const tempPassword = Math.random().toString(36).slice(-10);
    const hashed = await bcrypt.hash(tempPassword, 10);
    await prisma.employee.update({
      where: { employeeId },
      data: { password: hashed, isTempPassword: true },
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
      subject: "[Basak Chicken] 임시 비밀번호 안내",
      text: `임시 비밀번호: ${tempPassword}\n로그인 후 반드시 비밀번호를 변경해 주세요.`,
    });
    return res.status(200).json({ message: "임시 비밀번호가 이메일로 발송되었습니다." });
  } catch (error) {
    console.error("이메일 전송 오류:", error);
    return res.status(500).json({ error: "비밀번호 재설정 중 오류가 발생했습니다." });
  }
} 