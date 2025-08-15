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

export async function GET(request: NextRequest) {
  try {
    await verifyAdmin(request);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (isActive !== null && isActive !== '') where.isActive = isActive === 'true';

    const [notices, total] = await Promise.all([
      prisma.notice.findMany({
        where,
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notice.count({ where }),
    ]);

    return NextResponse.json({
      notices,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '조회 실패' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    const body = await request.json();
    const { title, content, isActive = true } = body || {};
    if (!title || !content) return NextResponse.json({ error: '제목/내용 필수' }, { status: 400 });
    const notice = await prisma.notice.create({
      data: { title: title.trim(), content: content.trim(), isActive, createdBy: admin.id },
      include: { author: { select: { name: true } } },
    });
    return NextResponse.json(notice, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '생성 실패' }, { status: 500 });
  }
}


