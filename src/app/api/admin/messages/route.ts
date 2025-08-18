import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';

async function verifyAdmin(request: NextRequest) {
  const adminAuth = request.cookies.get('__Host-admin_auth')?.value || request.cookies.get('admin_auth')?.value;
  if (!adminAuth) throw new Error('관리자 인증이 필요합니다.');
  const admin = await prisma.employee.findUnique({ where: { id: adminAuth }, select: { id: true, name: true, isSuperAdmin: true, email: true } });
  if (!admin || !admin.isSuperAdmin) throw new Error('관리자 권한이 필요합니다.');
  return admin;
}

export const runtime = 'nodejs';

// POST: 관리자 → 직원 메시지 전송 (옵션: 이메일 발송)
export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    const { recipientId, subject, content, sendEmail, threadId } = await req.json();
    if (!recipientId || !subject || !content) {
      return NextResponse.json({ error: 'recipientId/subject/content는 필수입니다.' }, { status: 400 });
    }

    // 수신자 유효성
    const recipient = await prisma.employee.findUnique({ where: { id: recipientId }, select: { id: true, name: true, email: true, isActive: true } });
    if (!recipient || !recipient.isActive) {
      return NextResponse.json({ error: '유효하지 않은 수신자입니다.' }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        senderId: admin.id,
        recipientId: recipient.id,
        subject: subject.trim(),
        content: content.trim(),
        threadId: threadId || undefined,
      }
    });

    // 루트 메시지인 경우 threadId를 자기 id로 설정
    if (!message.threadId) {
      await prisma.message.update({ where: { id: message.id }, data: { threadId: message.id } });
    }

    if (sendEmail && recipient.email) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.BASAK_SMTP_HOST,
          port: parseInt(process.env.BASAK_SMTP_PORT || '587'),
          secure: false,
          auth: { user: process.env.BASAK_SMTP_USER, pass: process.env.BASAK_SMTP_PASS }
        });
        await transporter.sendMail({
          from: process.env.BASAK_SMTP_FROM,
          to: recipient.email,
          subject: `[바삭치킨] 새 관리자 메시지: ${subject}`,
          html: `<div style="font-family: Pretendard, Arial, sans-serif; line-height:1.6; color:#111;">
                   <h2 style="margin:0 0 8px; font-size:18px;">관리자 메시지 도착</h2>
                   <p style="margin:4px 0; font-weight:600;">제목</p>
                   <p style="margin:0 0 12px;">${subject}</p>
                   <p style="margin:0; font-size:14px; color:#444;">보안 및 개인정보 보호를 위해 이메일에는 본문을 담지 않습니다.</p>
                   <p style="margin:8px 0 0; font-size:14px;">아래 링크에서 내용을 확인하세요.</p>
                   <p style="margin:12px 0 0;">
                     <a href="https://crew.basak-chicken.com/employee/messages" style="display:inline-block; background:#2563eb; color:#fff; padding:10px 14px; border-radius:8px; text-decoration:none;">받은 메시지 열기</a>
                   </p>
                 </div>`
        });
      } catch (e) {
        console.error('메시지 이메일 전송 실패:', e);
      }
    }

    return NextResponse.json({ ok: true, message });
  } catch (e: any) {
    console.error('메시지 전송 오류:', e);
    return NextResponse.json({ error: e.message || '메시지 전송 실패' }, { status: 500 });
  }
}

// GET: 관리자 메시지 목록(기본: 보낸함)
export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    const { searchParams } = new URL(req.url);
    const box = searchParams.get('box') || 'sent'; // sent | received
    const take = parseInt(searchParams.get('limit') || '20');
    const cursor = searchParams.get('cursor') || undefined;
    const employeeId = searchParams.get('employeeId') || undefined;
    const threadId = searchParams.get('threadId') || undefined;

    // thread 조회 우선
    if (threadId) {
      const thread = await prisma.message.findMany({
        where: { OR: [{ threadId }, { id: threadId }] },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true, subject: true, content: true, isRead: true, readAt: true, createdAt: true,
          recipientId: true, senderId: true, threadId: true,
          recipient: { select: { id: true, name: true } }
        }
      });
      return NextResponse.json({ messages: thread, nextCursor: null });
    }

    const where: any = {};
    if (box === 'received') {
      where.recipientId = admin.id;
    } else {
      where.senderId = admin.id;
      if (employeeId) where.recipientId = employeeId;
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      select: { 
        id: true, subject: true, content: true, isRead: true, readAt: true, createdAt: true, recipientId: true, senderId: true, threadId: true,
        recipient: { select: { id: true, name: true, email: true } },
        sender: { select: { id: true, name: true, email: true } }
      }
    });
    const nextCursor = messages.length === take ? messages[messages.length - 1].id : null;
    return NextResponse.json({ messages, nextCursor });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '조회 실패' }, { status: 500 });
  }
}


