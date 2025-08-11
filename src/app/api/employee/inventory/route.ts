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
      include: {
        tagRelations: {
          include: { tag: true }
        }
      }
    });

    // 상태 정보 및 태그 평탄화
    const itemsWithStatus = inventoryItems.map((item: any) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      currentStock: item.currentStock,
      minStock: item.minStock,
      unit: item.unit,
      supplier: item.supplier,
      lastUpdated: item.lastUpdated,
      lastCheckedBy: item.lastCheckedBy,
      status: item.currentStock <= item.minStock ? 'low' : 'sufficient',
      isLowStock: item.currentStock <= item.minStock,
      tags: (item.tagRelations || []).map((rel: any) => ({ id: rel.tag.id, name: rel.tag.name, color: rel.tag.color }))
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

// PUT: 직원용 재고 수량 업데이트 (체크리스트용)
export async function PUT(request: NextRequest) {
  try {
    const employee = await verifyEmployeeAuth();
    const body = await request.json();
    
    const { itemId, currentStock, notes, needsRestock } = body;

    if (!itemId || currentStock === undefined) {
      return NextResponse.json(
        { error: '재고 아이템 ID와 수량이 필요합니다.' },
        { status: 400 }
      );
    }

    // 재고 아이템 존재 확인 (활성화된 항목만)
    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: { 
        id: itemId,
        isActive: true
      }
    });

    console.log('재고 업데이트 요청:', { itemId, currentStock, employeeId: employee.id });
    console.log('기존 재고 아이템:', inventoryItem);
    console.log('재고 변경량 계산:', {
      previousStock: inventoryItem.currentStock,
      newStock: currentStock,
      calculatedChange: currentStock - inventoryItem.currentStock
    });

    if (!inventoryItem) {
      console.error('재고 아이템을 찾을 수 없음:', itemId);
      return NextResponse.json(
        { error: '재고 아이템을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 재고 수량 업데이트
    const updatedItem = await prisma.inventoryItem.update({
      where: { id: itemId },
      data: {
        currentStock: currentStock,
        lastUpdated: new Date(),
        // 이름을 저장하여 프론트에서 사람이름으로 바로 표시되도록 함
        lastCheckedBy: employee.name
      }
    });

    console.log('업데이트된 재고 아이템:', updatedItem);
    console.log('최종 응답 데이터:', {
      previousStock: inventoryItem.currentStock,
      currentStock: updatedItem.currentStock,
      stockChange: currentStock - inventoryItem.currentStock
    });

    // 재고 확인 기록 생성 (InventoryCheck)
    const checkRecord = await prisma.inventoryCheck.create({
      data: {
        itemId: itemId,
        checkedBy: employee.id,
        checkedAt: new Date(),
        currentStock: currentStock,
        notes: notes || null,
        needsRestock: needsRestock || (currentStock <= inventoryItem.minStock)
      }
    });

    return NextResponse.json({
      message: '재고 수량이 업데이트되었습니다.',
      item: {
        id: updatedItem.id,
        name: updatedItem.name,
        currentStock: updatedItem.currentStock,
        minStock: updatedItem.minStock,
        unit: updatedItem.unit
      },
      previousStock: inventoryItem.currentStock,
      stockChange: currentStock - inventoryItem.currentStock,
      checkRecord: {
        id: checkRecord.id,
        checkedAt: checkRecord.checkedAt,
        notes: checkRecord.notes,
        needsRestock: checkRecord.needsRestock
      }
    });

  } catch (error: any) {
    console.error('직원용 재고 업데이트 오류:', error);
    return NextResponse.json(
      { error: error.message || '재고 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 