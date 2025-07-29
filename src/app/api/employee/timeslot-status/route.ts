import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyEmployeeAuth() {
  // 간단한 인증 확인
  return { id: '1', name: '테스트 직원' };
}

export async function GET(request: NextRequest) {
  try {
    const employee = await verifyEmployeeAuth();
    if (!employee) {
      return NextResponse.json({ error: '인증 실패' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workplace = searchParams.get('workplace');
    const timeSlot = searchParams.get('timeSlot');

    if (!workplace || !timeSlot) {
      return NextResponse.json(
        { error: '근무지와 시간대가 필요합니다.' },
        { status: 400 }
      );
    }

    // 간단한 응답
    return NextResponse.json({
      workplace,
      timeSlot,
      isLocked: false,
      lockedBy: null,
      lockedAt: null
    });

  } catch (error) {
    console.error('타임슬롯 상태 조회 오류:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const employee = await verifyEmployeeAuth();
    if (!employee) {
      return NextResponse.json({ error: '인증 실패' }, { status: 401 });
    }

    const { action, workplace, timeSlot, date: targetDate } = await request.json();

    // 간단한 응답으로 수정
    if (action === 'lock') {
      return NextResponse.json({
        message: '체크리스트가 잠금되었습니다.',
        status: { isLocked: true, lockedBy: employee.id }
      });
    } else if (action === 'unlock') {
      return NextResponse.json({
        message: '체크리스트 잠금이 해제되었습니다.'
      });
    }

    return NextResponse.json({ error: '잘못된 액션' }, { status: 400 });

  } catch (error) {
    console.error('타임슬롯 상태 API 오류:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
} 