import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const employeeAuth = request.cookies.get('employee_auth')?.value;
    const adminAuth = request.cookies.get('admin_auth')?.value;

    console.log('[employee/me] cookieHeader:', cookieHeader ? 'present' : 'empty');
    console.log('[employee/me] employee_auth:', employeeAuth ? 'present' : 'missing');
    console.log('[employee/me] admin_auth:', adminAuth ? 'present' : 'missing');

    if (!employeeAuth && !adminAuth) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const authId = employeeAuth || adminAuth;
    const employee = await prisma.employee.findUnique({
      where: { id: authId! },
      select: {
        id: true,
        name: true,
        email: true,
        isSuperAdmin: true,
        department: true,
        position: true
      }
    });

    if (!employee) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error: any) {
    console.error('사용자 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '사용자 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 