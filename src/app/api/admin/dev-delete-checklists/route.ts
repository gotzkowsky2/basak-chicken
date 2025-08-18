import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers';

async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get('admin_auth');
  const employeeAuth = cookieStore.get('employee_auth');
  
  if (!adminAuth && !employeeAuth) {
    throw new Error('인증이 필요합니다.');
  }

  const authId = adminAuth?.value || employeeAuth?.value;
  const employee = await prisma.employee.findUnique({
    where: { id: authId },
    select: { id: true, name: true, isSuperAdmin: true }
  });

  if (!employee) {
    throw new Error('유효하지 않은 사용자입니다.');
  }

  // admin_auth 쿠키가 있거나 최고 관리자인 경우만 허용
  if (!adminAuth && !employee.isSuperAdmin) {
    throw new Error('관리자 권한이 필요합니다.');
  }

  return employee;
}

export async function POST(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const admin = await verifyAdminAuth();
    
    const body = await request.json();
    const { targetDate } = body;

    if (!targetDate) {
      return NextResponse.json(
        { error: '날짜가 필요합니다.' },
        { status: 400 }
      );
    }

    // 해당 날짜의 모든 체크리스트 삭제 (ChecklistInstance 사용)
    const deletedChecklists = await prisma.checklistInstance.deleteMany({
      where: {
        date: {
          gte: new Date(targetDate),
          lt: new Date(new Date(targetDate).getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    return NextResponse.json({
      message: '테스트용 체크리스트 삭제 완료',
      date: targetDate,
      deletedCount: deletedChecklists.count
    });

  } catch (error: any) {
    console.error('체크리스트 삭제 오류:', error);
    return NextResponse.json(
      { error: error.message || '체크리스트 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}