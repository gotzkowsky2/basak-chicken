import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    const employees = await prisma.employee.findMany({
      select: { employeeId: true, email: true, isTempPassword: true },
      take: 20,
    });
    return res.status(200).json({ employees });
  } catch (error) {
    console.error("DB 조회 오류:", error);
    return res.status(500).json({ error: "DB 조회 중 오류 발생" });
  }
} 