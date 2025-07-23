import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as cookie from "cookie";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    const { employeeId, password } = req.body;
    if (!employeeId || !password) {
      return res.status(400).json({ error: "아이디와 비밀번호를 입력하세요." });
    }
    const employee = await prisma.employee.findUnique({
      where: { employeeId },
    });
    if (!employee || !employee.isActive) {
      console.log("[로그인] 직원 없음 또는 비활성화:", employeeId);
      return res.status(403).json({ error: "존재하지 않거나 비활성화된 직원입니다." });
    }
    console.log("[로그인] 입력 비밀번호:", password);
    console.log("[로그인] DB 해시:", employee.password);
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, employee.password);
      console.log("[로그인] bcrypt.compare 결과:", isMatch);
    } catch (err) {
      console.error("[로그인] bcrypt.compare 에러:", err);
    }
    if (!isMatch) {
      return res.status(401).json({ error: "비밀번호가 일치하지 않습니다." });
    }
    const isTempPassword = !!employee.isTempPassword;
    const { password: _, ...employeeWithoutPassword } = employee;
    // Set cookies
    const cookies = [
      cookie.serialize("employee_auth", employee.id, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      }),
      cookie.serialize("temp_pw_auth", isTempPassword ? "1" : "", {
        httpOnly: true,
        path: "/",
        maxAge: isTempPassword ? 60 * 60 : 0,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      }),
    ];
    res.setHeader("Set-Cookie", cookies);
    return res.status(200).json({ employee: employeeWithoutPassword, isTempPassword });
  } catch (error) {
    console.error("로그인 에러:", error);
    return res.status(500).json({ error: "로그인 중 오류가 발생했습니다." });
  }
} 