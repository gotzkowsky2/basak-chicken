import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const employeeAuth = req.cookies.get('employee_auth')?.value;

  if (pathname === '/employee/login' && employeeAuth) {
    // DB에서 직접 직원 정보 조회
    const employee = await prisma.employee.findUnique({ where: { id: employeeAuth } });
    if (employee?.isSuperAdmin) {
      return NextResponse.redirect(new URL('/admin-choose', req.url));
    } else {
      return NextResponse.redirect(new URL('/employee', req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/employee/login'],
}; 