import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma";
import bcrypt from "bcryptjs";

// 디버깅: 실제로 읽히는 DATABASE_URL을 콘솔에 출력
console.log('DEBUG DATABASE_URL:', process.env.DATABASE_URL);

const prisma = new PrismaClient();

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
    });

    // 비밀번호 제외하고 반환
    const employeesWithoutPassword = employees.map((employee: any) => {
      const { password, ...employeeWithoutPassword } = employee;
      return employeeWithoutPassword;
    });

    return NextResponse.json(employeesWithoutPassword);
  } catch (error) {
    console.error("직원 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "직원 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 필수 필드 검증
    if (!body.employeeId || !body.password || !body.name || !body.department || !body.position) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 중복 직원 ID 검증
    const existingEmployee = await prisma.employee.findUnique({
      where: { employeeId: body.employeeId },
    });

    if (existingEmployee) {
      return NextResponse.json(
        { error: "이미 존재하는 직원 ID입니다." },
        { status: 400 }
      );
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // 직원 생성
    const newEmployee = await prisma.employee.create({
      data: {
        employeeId: body.employeeId,
        password: hashedPassword,
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        department: body.department,
        position: body.position,
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
    });

    // 비밀번호 제외하고 반환
    const { password, ...employeeWithoutPassword } = newEmployee;

    return NextResponse.json(employeeWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("직원 추가 오류:", error);
    return NextResponse.json(
      { error: "직원 추가 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 