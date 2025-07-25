import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const employeeAuth = req.cookies.get("employee_auth")?.value;
    if (!employeeAuth) {
      return NextResponse.json({ error: "인증 정보가 없습니다." }, { status: 401 });
    }

    const employee = await prisma.employee.findUnique({ 
      where: { id: employeeAuth },
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        department: true,
        position: true,
        isSuperAdmin: true
      }
    });

    if (!employee) {
      return NextResponse.json({ error: "직원 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error("직원 정보 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
} 