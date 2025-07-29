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

// POST: 구매 요청 생성
export async function POST(request: NextRequest) {
  try {
    const employee = await verifyEmployeeAuth();

    const body = await request.json();
    const { items, itemId, quantity, priority, estimatedCost, notes } = body;

    // 단일 아이템 구매 요청인 경우
    if (itemId && quantity) {
      const purchaseRequest = await prisma.purchaseRequest.create({
        data: {
          requestedBy: employee.id,
          status: 'PENDING',
          priority: priority || 'MEDIUM',
          estimatedCost: estimatedCost || null,
          notes: notes || null,
          requestedAt: new Date()
        }
      });

      const purchaseRequestItem = await prisma.purchaseRequestItem.create({
        data: {
          purchaseRequestId: purchaseRequest.id,
          itemId: itemId,
          quantity: quantity,
          unitPrice: null,
          notes: notes || null
        }
      });

      return NextResponse.json({
        ...purchaseRequest,
        items: [purchaseRequestItem]
      }, { status: 201 });
    }

    // 다중 아이템 구매 요청인 경우
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: '구매할 아이템이 필요합니다.' },
        { status: 400 }
      );
    }

    // 구매 요청 생성
    const purchaseRequest = await prisma.purchaseRequest.create({
      data: {
        requestedBy: employee.id,
        status: 'PENDING',
        priority: priority || 'MEDIUM',
        estimatedCost: estimatedCost || null,
        notes: notes || null,
        requestedAt: new Date()
      }
    });

    // 구매 요청 아이템들 생성
    const purchaseRequestItems = await Promise.all(
      items.map(async (item: any) => {
        return await prisma.purchaseRequestItem.create({
          data: {
            purchaseRequestId: purchaseRequest.id,
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice || null,
            notes: item.notes || null
          }
        });
      })
    );

    return NextResponse.json({
      ...purchaseRequest,
      items: purchaseRequestItems
    }, { status: 201 });
  } catch (error: any) {
    console.error('구매 요청 생성 오류:', error);
    return NextResponse.json(
      { error: error.message || '구매 요청 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// GET: 직원의 구매 요청 목록 조회
export async function GET(request: NextRequest) {
  try {
    const employee = await verifyEmployeeAuth();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // 필터 조건 구성
    const where: any = {
      requestedBy: employee.id
    };

    if (status && status !== 'ALL') {
      where.status = status;
    }

    const purchaseRequests = await prisma.purchaseRequest.findMany({
      where,
      orderBy: [
        { requestedAt: 'desc' }
      ],
      include: {
        items: {
          include: {
            item: {
              select: {
                name: true,
                unit: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(purchaseRequests);
  } catch (error: any) {
    console.error('구매 요청 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '구매 요청 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 