import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";

const prisma = new PrismaClient();

// 직원 목록 조회 (GET)
export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        phone: true,
        department: true,
        position: true,
        isActive: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ employees });
  } catch (error) {
    return NextResponse.json({ error: "직원 목록 조회 실패" }, { status: 500 });
  }
}

// 직원 추가 (POST)
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { employeeId, password, name, email, phone, department, position, isSuperAdmin } = data;
    if (!employeeId || !password || !name || !department || !position) {
      return NextResponse.json({ error: "필수 항목 누락" }, { status: 400 });
    }
    const newEmployee = await prisma.employee.create({
      data: {
        employeeId,
        password, // 실제 서비스에서는 반드시 해시 처리 필요
        name,
        email,
        phone,
        department,
        position,
        isSuperAdmin: !!isSuperAdmin,
      },
    });
    return NextResponse.json({ employee: newEmployee });
  } catch (error) {
    return NextResponse.json({ error: "직원 추가 실패" }, { status: 500 });
  }
} 