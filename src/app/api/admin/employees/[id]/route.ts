import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../../generated/prisma";
import { UpdateEmployeeData } from "@/types/employee";

const prisma = new PrismaClient();

// 직원 수정 (PUT)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    const { id } = await params;

    await prisma.employee.delete({
      where: { id },
    });

    return NextResponse.json({ message: "직원이 삭제되었습니다." });
  } catch (error) {
    return NextResponse.json({ error: "직원 삭제 실패" }, { status: 500 });
  }
} 