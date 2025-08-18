import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const employeeAuth = request.cookies.get('__Host-employee_auth')?.value || request.cookies.get('employee_auth')?.value;
    const adminAuth = request.cookies.get('__Host-admin_auth')?.value || request.cookies.get('admin_auth')?.value;

    if (process.env.NODE_ENV !== 'production') {
      console.log('[employee/me] cookieHeader:', cookieHeader ? 'present' : 'empty');
      console.log('[employee/me] employee_auth:', employeeAuth ? 'present' : 'missing');
      console.log('[employee/me] admin_auth:', adminAuth ? 'present' : 'missing');
    }

    if (!employeeAuth && !adminAuth) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 1) 직원 세션 우선
    if (employeeAuth) {
      const employee = await prisma.employee.findUnique({
        where: { id: employeeAuth },
        select: { id: true, name: true, email: true, isSuperAdmin: true, department: true, position: true }
      });
      if (employee) return NextResponse.json(employee);
    }

    // 2) 관리자 세션 허용: 관리자도 Employee 테이블에 존재하므로 동일 조회
    if (adminAuth) {
      const adminAsEmployee = await prisma.employee.findUnique({
        where: { id: adminAuth },
        select: { id: true, name: true, email: true, isSuperAdmin: true, department: true, position: true }
      });
      if (adminAsEmployee) return NextResponse.json(adminAsEmployee);
      // 직원 레코드가 없더라도 관리자 세션이면 헤더 구동을 위해 최소 정보 반환
      const admin = await prisma.admin.findUnique({ where: { id: adminAuth }, select: { id: true, name: true, email: true } });
      if (admin) {
        return NextResponse.json({
          id: admin.id,
          name: admin.name,
          email: admin.email,
          isSuperAdmin: true,
          department: '관리자',
          position: '관리자'
        });
      }
    }

    return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
  } catch (error: any) {
    console.error('사용자 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '사용자 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 