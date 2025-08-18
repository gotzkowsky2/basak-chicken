import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // 간단한 DB 핑 시도 (실패하더라도 서비스 헬스는 200으로, DB 상태를 별도 필드로 표기)
    let db = 'unknown';
    try {
      await prisma.$queryRaw`SELECT 1`;
      db = 'ok';
    } catch {
      db = 'error';
    }
    const mem = process.memoryUsage();
    const metrics = {
      pid: process.pid,
      uptimeSec: Math.round(process.uptime()),
      rss: mem.rss,
      heapTotal: mem.heapTotal,
      heapUsed: mem.heapUsed,
      external: mem.external,
    };
    return NextResponse.json({ ok: true, time: new Date().toISOString(), db, metrics });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'unknown' }, { status: 200 });
  }
}



