import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { randomUUID } from 'crypto';

async function verifyEmployee(request: NextRequest) {
  const id = request.cookies.get('__Host-employee_auth')?.value || request.cookies.get('employee_auth')?.value;
  if (!id) throw new Error('로그인이 필요합니다.');
  const employee = await prisma.employee.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!employee) throw new Error('유효하지 않은 사용자');
  return employee;
}

export const runtime = 'nodejs';

// GET: 받은 메시지 목록/카운트
export async function GET(req: NextRequest) {
  try {
    const me = await verifyEmployee(req);
    if ((await prisma.employee.findUnique({ where: { id: me.id }, select: { isSuperAdmin: true } }))?.isSuperAdmin) {
      return NextResponse.json({ error: '최고관리자는 직원 메시지 API를 사용할 수 없습니다.' }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const take = parseInt(searchParams.get('limit') || '20');
    const cursor = searchParams.get('cursor') || undefined;
    const threadId = searchParams.get('threadId') || undefined;
    const box = searchParams.get('box') || 'inbox'; // inbox | sent

    // 특정 스레드 조회(직원 측)
    if (threadId) {
      const thread = await prisma.message.findMany({
        where: { OR: [{ threadId }, { id: threadId }] },
        orderBy: { createdAt: 'asc' },
        select: { id: true, subject: true, content: true, isRead: true, createdAt: true, threadId: true, senderId: true, recipientId: true }
      });
      return NextResponse.json({ messages: thread, unreadCount: 0, nextCursor: null });
    }

    // 목록 조회: 받은함/보낸함의 스레드 단위 최신 메시지로 구성
    const whereBase:any = box === 'sent' ? { senderId: me.id } : { recipientId: me.id };
    if (unreadOnly && box !== 'sent') whereBase.isRead = false;

    // 넉넉히 가져와 스레드로 유일화 (간단 구현: 페이지네이션은 nextCursor null 처리)
    const raw = await prisma.message.findMany({
      where: whereBase,
      orderBy: { createdAt: 'desc' },
      take: Math.max(take * 3, 60),
      select: { id: true, subject: true, isRead: true, createdAt: true, threadId: true }
    });
    const threadsSeen = new Set<string>();
    const list:any[] = [];
    for (const m of raw) {
      const key = m.threadId || m.id;
      if (!threadsSeen.has(key)) {
        threadsSeen.add(key);
        list.push(m);
        if (list.length >= take) break;
      }
    }
    const unreadCount = await prisma.message.count({ where: { recipientId: me.id, isRead: false } });
    return NextResponse.json({ messages: list, unreadCount, nextCursor: null });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '조회 실패' }, { status: 500 });
  }
}

// POST: 직원 → 관리자 메시지 전송
export async function POST(req: NextRequest) {
  try {
    const me = await verifyEmployee(req);
    if ((await prisma.employee.findUnique({ where: { id: me.id }, select: { isSuperAdmin: true } }))?.isSuperAdmin) {
      return NextResponse.json({ error: '최고관리자는 직원 메시지 API를 사용할 수 없습니다.' }, { status: 403 });
    }
    const { subject, content, threadId } = await req.json();
    if (!subject || !content) {
      return NextResponse.json({ error: 'subject/content는 필수입니다.' }, { status: 400 });
    }
    // 기본 수신자: 최고관리자들
    const admins = await prisma.employee.findMany({ where: { isSuperAdmin: true }, select: { id: true } });
    if (admins.length === 0) {
      return NextResponse.json({ error: '관리자를 찾을 수 없습니다.' }, { status: 400 });
    }
    const thread = threadId || randomUUID();
    // 스레드의 이전 메시지가 있다면 마지막 메시지의 sender에 따라 수신자를 역으로 설정 (단일 답장 대상)
    let recipientId = admins[0].id;
    if (threadId) {
      const last = await prisma.message.findFirst({ where: { OR: [{ threadId }, { id: threadId }] }, orderBy: { createdAt: 'desc' }, select: { senderId: true, recipientId: true } });
      if (last) {
        recipientId = last.senderId === me.id ? last.recipientId : last.senderId;
      }
    }
    const created = await prisma.message.create({ data: { senderId: me.id, recipientId, subject: subject.trim(), content: content.trim(), threadId: thread } });
    return NextResponse.json({ ok: true, id: created.id, threadId: thread });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '전송 실패' }, { status: 500 });
  }
}

