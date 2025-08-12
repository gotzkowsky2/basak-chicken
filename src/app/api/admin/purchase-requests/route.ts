import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 관리자 또는 최고관리자 인증 확인 함수
async function verifyAdminAuth(request: NextRequest) {
  const superAdminAuth = request.cookies.get('superadmin_auth')?.value;
  const adminAuth = request.cookies.get('admin_auth')?.value;
  const employeeAuth = request.cookies.get('employee_auth')?.value;

  if (!superAdminAuth && !adminAuth) {
    throw new Error('관리자 인증이 필요합니다.');
  }

  if (superAdminAuth) {
    const superAdmin = await prisma.employee.findUnique({
      where: { id: superAdminAuth },
      select: { name: true, isSuperAdmin: true },
    });
    if (!superAdmin || !superAdmin.isSuperAdmin) {
      throw new Error('최고관리자 권한이 필요합니다.');
    }
    return superAdmin;
  }

  const adminId = (adminAuth || employeeAuth) as string;
  const admin = await prisma.employee.findUnique({
    where: { id: adminId },
    select: { name: true, isSuperAdmin: true },
  });
  if (!admin) {
    throw new Error('관리자 정보를 찾을 수 없습니다.');
  }
  return admin;
}

// GET: 구매 요청 목록 조회
export async function GET(request: NextRequest) {
  try {
    await verifyAdminAuth(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    // 필터 조건 구성
    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (priority && priority !== 'ALL') {
      where.priority = priority;
    }

    const purchaseRequests = await prisma.purchaseRequest.findMany({
      where,
      orderBy: [
        { requestedAt: 'desc' }
      ],
      include: {
        employee: {
          select: {
            name: true,
            department: true
          }
        },
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

// PUT: 구매 요청 상태 변경 (승인/거부)
export async function PUT(request: NextRequest) {
  try {
    await verifyAdminAuth(request);

    const body = await request.json();
    const { id, status, approvedBy } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: '구매 요청 ID와 상태가 필요합니다.' },
        { status: 400 }
      );
    }

    // 구매 요청 존재 확인
    const existingRequest = await prisma.purchaseRequest.findUnique({
      where: { id }
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: '존재하지 않는 구매 요청입니다.' },
        { status: 404 }
      );
    }

    // 구매 요청 상태 업데이트
    const updatedRequest = await prisma.purchaseRequest.update({
      where: { id },
      data: {
        status,
        approvedBy: approvedBy || null,
        approvedAt: status === 'APPROVED' || status === 'REJECTED' ? new Date() : null
      }
    });

    return NextResponse.json(updatedRequest);
  } catch (error: any) {
    console.error('구매 요청 상태 변경 오류:', error);
    return NextResponse.json(
      { error: error.message || '구매 요청 상태 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 