import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { UpdateEmployeeData } from "@/types/employee";

const prisma = new PrismaClient();

// 관리자 인증 확인 함수 (슈퍼관리자만 허용)
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

// 직원 수정 (PUT)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdminAuth(req);
    const data: UpdateEmployeeData = await req.json();
    const { id } = await params;

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        department: data.department,
        position: data.position,
        isActive: data.isActive,
        isSuperAdmin: data.isSuperAdmin,
      },
    });

    return NextResponse.json({ employee: updatedEmployee });
  } catch (error) {
    return NextResponse.json({ error: "직원 수정 실패" }, { status: 500 });
  }
}

// 직원 삭제 (DELETE)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdminAuth(req);
    const { id } = await params;

    // 하드 삭제 대신 비활성 처리(참조 무결성 문제 예방)
    const updated = await prisma.employee.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, name: true, isActive: true }
    });

    return NextResponse.json({ message: "직원이 비활성화되었습니다.", employee: updated });
  } catch (error) {
    return NextResponse.json({ error: "직원 삭제 실패" }, { status: 500 });
  }
} 