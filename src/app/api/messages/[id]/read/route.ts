import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

async function verifyEmployee(request: NextRequest) {
  const id = request.cookies.get('__Host-employee_auth')?.value || request.cookies.get('employee_auth')?.value;
  if (!id) throw new Error('로그인이 필요합니다.');
  const employee = await prisma.employee.findUnique({ where: { id }, select: { id: true } });
  if (!employee) throw new Error('유효하지 않은 사용자');
  return employee;
}

export const runtime = 'nodejs';

// PATCH: 읽음 처리
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const me = await verifyEmployee(req);
    if (me && (await prisma.employee.findUnique({ where: { id: me.id }, select: { isSuperAdmin: true } }))?.isSuperAdmin) {
      return NextResponse.json({ error: '최고관리자는 직원 메시지 API를 사용할 수 없습니다.' }, { status: 403 });
    }
    const id = params.id;
    const msg = await prisma.message.findUnique({ where: { id }, select: { id: true, recipientId: true, isRead: true } });
    if (!msg || msg.recipientId !== me.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }
    if (!msg.isRead) {
      await prisma.message.update({ where: { id }, data: { isRead: true, readAt: new Date() } });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '읽음 처리 실패' }, { status: 500 });
  }
}


