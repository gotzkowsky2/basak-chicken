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
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "비밀번호는 6자 이상이어야 합니다." });
    }
    // 인증 쿠키에서 직원 ID 추출
    console.log('[비밀번호 변경] req.headers.cookie:', req.headers.cookie);
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const employeeId = cookies["employee_auth"];
    if (!employeeId) {
      return res.status(401).json({ error: "인증 정보가 없습니다. 다시 로그인해 주세요." });
    }
    // 직원 정보 조회
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
      return res.status(404).json({ error: "직원 정보를 찾을 수 없습니다." });
    }
    // 비밀번호 해시 저장
    const hashed = await bcrypt.hash(password, 10);
    await prisma.employee.update({
      where: { id: employeeId },
      data: { password: hashed, isTempPassword: false },
    });
    // 쿠키 갱신: temp_pw_auth 삭제, employee_auth 갱신
    res.setHeader("Set-Cookie", [
      cookie.serialize("temp_pw_auth", "", {
        httpOnly: true,
        path: "/",
        maxAge: 0,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      }),
      cookie.serialize("employee_auth", employeeId, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      }),
    ]);
    return res.status(200).json({ message: "비밀번호가 성공적으로 변경되었습니다." });
  } catch (error) {
    return res.status(500).json({ error: "비밀번호 변경 중 오류가 발생했습니다." });
  }
} 