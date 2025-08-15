import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyEmployee(request: NextRequest) {
  const employeeAuth = request.cookies.get('employee_auth')?.value;
  if (!employeeAuth) throw new Error('로그인이 필요합니다.');
  const employee = await prisma.employee.findUnique({ where: { id: employeeAuth }, select: { id: true, name: true } });
  if (!employee) throw new Error('유효하지 않은 인증');
  return employee;
}

export async function GET(request: NextRequest) {
  try {
    await verifyEmployee(request);
    const { searchParams } = new URL(request.url);
    const noticeLimit = parseInt(searchParams.get('noticeLimit') || '3');
    const manualLimit = parseInt(searchParams.get('manualLimit') || '5');
    const precautionLimit = parseInt(searchParams.get('precautionLimit') || '5');

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [notices, manuals, precautions] = await Promise.all([
      prisma.notice.findMany({ where: { isActive: true }, include: { author: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: noticeLimit }),
      prisma.manual.findMany({ where: { isActive: true, updatedAt: { gte: sevenDaysAgo } }, orderBy: { updatedAt: 'desc' }, take: manualLimit }),
      prisma.precaution.findMany({ where: { isActive: true, OR: [{ createdAt: { gte: sevenDaysAgo } }, { updatedAt: { gte: sevenDaysAgo } }] }, orderBy: { updatedAt: 'desc' }, take: precautionLimit }),
    ]);

    return NextResponse.json({ notices, updatedManuals: manuals, newPrecautions: precautions, metadata: { cutoffDate: sevenDaysAgo.toISOString() } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '조회 실패' }, { status: 500 });
  }
}


