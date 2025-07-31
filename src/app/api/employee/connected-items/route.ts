import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 직원 인증 확인 함수
async function verifyEmployeeAuth() {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const employeeAuth = cookieStore.get('employee_auth');
  
  if (!employeeAuth) {
    throw new Error('인증이 필요합니다.');
  }

  const employee = await prisma.employee.findFirst({
    where: {
      id: employeeAuth.value
    }
  });

  if (!employee) {
    throw new Error('유효하지 않은 세션입니다.');
  }

  return employee;
}

// GET: 연결된 항목의 실제 내용 조회
export async function GET(request: NextRequest) {
  try {
    await verifyEmployeeAuth();
    const { searchParams } = new URL(request.url);
    const itemType = searchParams.get('type');
    const itemId = searchParams.get('id');

    if (!itemType || !itemId) {
      return NextResponse.json(
        { error: '타입과 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    let result = null;

    switch (itemType) {
      case 'inventory':
        result = await prisma.inventoryItem.findUnique({
          where: { id: itemId },
          include: {
            tags: true
          }
        });
        break;
      case 'precaution':
        result = await prisma.precaution.findUnique({
          where: { id: itemId },
          include: {
            tags: true
          }
        });
        break;
      case 'manual':
        result = await prisma.manual.findUnique({
          where: { id: itemId },
          include: {
            tags: true
          }
        });
        break;
      default:
        return NextResponse.json(
          { error: '지원하지 않는 타입입니다.' },
          { status: 400 }
        );
    }

    if (!result) {
      return NextResponse.json(
        { error: '항목을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('연결된 항목 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 