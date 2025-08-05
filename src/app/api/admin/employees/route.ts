import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 관리자 인증 확인 함수
async function verifyAdminAuth(request: NextRequest) {
  const adminAuth = request.cookies.get('admin_auth')?.value;
  const employeeAuth = request.cookies.get('employee_auth')?.value;
  
  if (!adminAuth && !employeeAuth) {
    throw new Error('관리자 인증이 필요합니다.');
  }

  const authId = adminAuth || employeeAuth;
  const employee = await prisma.employee.findUnique({ 
    where: { id: authId },
    select: { name: true, isSuperAdmin: true }
  });

  if (!employee || !employee.isSuperAdmin) {
    throw new Error('관리자 권한이 필요합니다.');
  }

  return employee;
}

// GET: 직원 목록 조회
export async function GET(request: NextRequest) {
  try {
    await verifyAdminAuth(request);

    const employees = await prisma.employee.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        isSuperAdmin: true,
        createdAt: true
      },
      orderBy: [
        { name: 'asc' }
      ]
    });

    return NextResponse.json(employees);
  } catch (error: any) {
    console.error('직원 목록 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '직원 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
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