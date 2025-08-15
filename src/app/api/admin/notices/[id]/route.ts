import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyAdmin(request: NextRequest) {
  const adminAuth = request.cookies.get('admin_auth')?.value;
  const employeeAuth = request.cookies.get('employee_auth')?.value;
  if (!adminAuth && !employeeAuth) throw new Error('관리자 인증이 필요합니다.');
  const authId = adminAuth || employeeAuth;
  const employee = await prisma.employee.findUnique({
    where: { id: authId },
    select: { id: true, name: true, isSuperAdmin: true },
  });
  if (!employee || !employee.isSuperAdmin) throw new Error('관리자 권한이 필요합니다.');
  return employee;
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const notice = await prisma.notice.findUnique({
      where: { id: params.id },
      include: { author: { select: { name: true } } },
    });
    if (!notice) return NextResponse.json({ error: '없음' }, { status: 404 });
    return NextResponse.json(notice);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '조회 실패' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await verifyAdmin(request);
    const body = await request.json();
    const { title, content, isActive } = body || {};
    if (!title || !content) return NextResponse.json({ error: '제목/내용 필수' }, { status: 400 });
    const notice = await prisma.notice.update({
      where: { id: params.id },
      data: { title: title.trim(), content: content.trim(), ...(isActive === undefined ? {} : { isActive }) },
      include: { author: { select: { name: true } } },
    });
    return NextResponse.json(notice);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '수정 실패' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await verifyAdmin(request);
    const notice = await prisma.notice.update({ where: { id: params.id }, data: { isActive: false } });
    return NextResponse.json({ message: '삭제(비활성) 완료', notice });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '삭제 실패' }, { status: 500 });
  }
}


