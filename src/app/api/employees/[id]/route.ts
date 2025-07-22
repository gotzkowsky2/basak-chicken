import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // 기존 직원 정보 조회
    const existingEmployee = await prisma.employee.findUnique({
      where: { id }
    });

    if (!existingEmployee) {
      return NextResponse.json(
        { error: "직원을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 업데이트할 데이터 준비
    const updateData: any = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      department: body.department,
      position: body.position,
      isActive: body.isActive !== undefined ? body.isActive : existingEmployee.isActive,
      isSuperAdmin: body.isSuperAdmin !== undefined ? body.isSuperAdmin : existingEmployee.isSuperAdmin,
    };

    // 비밀번호가 제공된 경우에만 해시화하여 업데이트
    if (body.password && body.password.trim()) {
      const hashedPassword = await bcrypt.hash(body.password, 10);
      updateData.password = hashedPassword;
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    // 비밀번호 제외하고 반환
    const { password, ...employeeWithoutPassword } = updatedEmployee;

    return NextResponse.json(employeeWithoutPassword);
  } catch (error) {
    console.error("직원 수정 오류:", error);
    return NextResponse.json(
      { error: "직원 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deletedEmployee = await prisma.employee.delete({
      where: { id },
    });

    return NextResponse.json({ message: "직원이 삭제되었습니다." });
  } catch (error) {
    console.error("직원 삭제 오류:", error);
    return NextResponse.json(
      { error: "직원 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 