import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import * as cookie from "cookie";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    const cookiesObj = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const employeeId = cookiesObj["employee_auth"];
    if (!employeeId) {
      return res.status(401).json({ error: "인증 정보가 없습니다." });
    }
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
      return res.status(404).json({ error: "직원 정보를 찾을 수 없습니다." });
    }
    return res.status(200).json({ isSuperAdmin: employee.isSuperAdmin, name: employee.name, email: employee.email });
  } catch (error) {
    return res.status(500).json({ error: "직원 정보 조회 중 오류가 발생했습니다." });
  }
} 