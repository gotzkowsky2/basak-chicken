import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// 관리자 인증 확인 함수
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

// POST: 개별 체크리스트 삭제
export async function POST(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const admin = await verifyAdminAuth();
    
    const body = await request.json();
    
    const { instanceId } = body;

    if (!instanceId) {
      return NextResponse.json(
        { error: '체크리스트 인스턴스 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 체크리스트 인스턴스 확인
    const instance = await prisma.checklistInstance.findUnique({
      where: { id: instanceId },
      include: {
        template: true,
        connectedItemsProgress: true
      }
    });

    if (!instance) {
      return NextResponse.json(
        { error: '해당 체크리스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 연결된 항목들의 진행 상태 먼저 삭제
    if (instance.connectedItemsProgress.length > 0) {
      await prisma.connectedItemProgress.deleteMany({
        where: { instanceId: instanceId }
      });
    }

    // 체크리스트 인스턴스 삭제
    await prisma.checklistInstance.delete({
      where: { id: instanceId }
    });

    return NextResponse.json({
      success: true,
      message: '체크리스트가 성공적으로 삭제되었습니다.',
      deletedInstance: {
        id: instance.id,
        templateName: instance.template.name,
        workplace: instance.workplace,
        timeSlot: instance.timeSlot,
        date: instance.date
      }
    });

  } catch (error: any) {
    console.error('개별 체크리스트 삭제 오류:', error);
    return NextResponse.json(
      { error: error.message || '체크리스트 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 