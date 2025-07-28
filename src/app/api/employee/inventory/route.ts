import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// 직원 인증 확인 함수
async function verifyEmployeeAuth() {
  const cookieStore = await cookies();
  const employeeAuth = cookieStore.get('employee_auth');
  
  if (!employeeAuth) {
    throw new Error('직원 인증이 필요합니다.');
  }

  const employee = await prisma.employee.findFirst({
    where: {
      id: employeeAuth.value
    }
  });

  if (!employee) {
    throw new Error('유효하지 않은 직원 세션입니다.');
  }

  return employee;
}

// GET: 직원용 재고 아이템 목록 조회 (읽기 전용)
export async function GET(request: NextRequest) {
  try {
    await verifyEmployeeAuth();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const lowStock = searchParams.get('lowStock');

    // 필터 조건 구성
    const where: any = {
      isActive: true
    };

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { supplier: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (lowStock === 'true') {
      where.currentStock = {
        lte: prisma.inventoryItem.fields.minStock
      };
    }

    const inventoryItems = await prisma.inventoryItem.findMany({
      where,
      orderBy: [
        { name: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        category: true,
        currentStock: true,
        minStock: true,
        unit: true,
        supplier: true,
        lastUpdated: true,
        lastCheckedBy: true
      }
    });

    // 상태 정보 추가
    const itemsWithStatus = inventoryItems.map(item => ({
      ...item,
      status: item.currentStock <= item.minStock ? 'low' : 'sufficient',
      isLowStock: item.currentStock <= item.minStock
    }));

    return NextResponse.json(itemsWithStatus);
  } catch (error: any) {
    console.error('직원용 재고 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '재고 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 