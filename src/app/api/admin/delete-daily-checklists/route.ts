import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get('admin_auth');
  
  if (!adminAuth) {
    throw new Error('관리자 인증이 필요합니다.');
  }

  const admin = await prisma.admin.findFirst({
    where: {
      id: adminAuth.value
    }
  });

  if (!admin) {
    throw new Error('유효하지 않은 관리자 세션입니다.');
  }

  return admin;
}

export async function DELETE(request: NextRequest) {
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

    // 해당 날짜의 모든 체크리스트 삭제
    const deletedChecklists = await prisma.checklistInstance.deleteMany({
      where: {
        date: {
          gte: new Date(targetDate),
          lt: new Date(new Date(targetDate).getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    return NextResponse.json({
      message: '일일 체크리스트 삭제 완료',
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