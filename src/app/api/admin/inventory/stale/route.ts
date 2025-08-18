import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

async function verifyAdmin(request: NextRequest) {
  const cookieOrder = ['__Host-admin_auth', '__Host-employee_auth', 'admin_auth', 'employee_auth'];
  let id: string | undefined;
  for (const name of cookieOrder) {
    const v = request.cookies.get(name)?.value;
    if (v) { id = v; break; }
  }
  if (!id) throw new Error('관리자 인증이 필요합니다.');
  const emp = await prisma.employee.findUnique({ where: { id }, select: { isSuperAdmin: true } });
  // admin_auth가 있으면 통과, 아니면 최고관리자만
  const hasAdminAuth = !!(request.cookies.get('admin_auth')?.value || request.cookies.get('__Host-admin_auth')?.value);
  if (!hasAdminAuth && (!emp || !emp.isSuperAdmin)) throw new Error('관리자 권한이 필요합니다.');
}

export async function GET(request: NextRequest) {
  try {
    await verifyAdmin(request);
    const { searchParams } = new URL(request.url);
    // 기본 2일: 한번도 업데이트가 없거나, 2일 이상 지난 항목
    const days = parseInt(searchParams.get('days') || '2');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // 후보군(생성 시점 또는 마지막 업데이트가 기준일 이전)
    const items = await prisma.inventoryItem.findMany({
      where: { isActive: true, OR: [{ lastUpdated: { lte: cutoffDate } }, { createdAt: { lte: cutoffDate } }] },
      orderBy: [{ lastUpdated: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, name: true, category: true, currentStock: true, minStock: true, unit: true, supplier: true, lastUpdated: true, lastCheckedBy: true, createdAt: true, tagRelations: { include: { tag: true } } },
    });

    // 진짜 경고 조건: (1) 마지막 업데이트가 기준일 이전이거나 (2) 생성 이후 단 한 번도 업데이트 안됨(= createdAt === lastUpdated) && 생성일이 기준일 이전
    const filtered = items.filter(i => {
      const last = new Date(i.lastUpdated);
      const created = new Date(i.createdAt);
      const neverUpdated = last.getTime() === created.getTime();
      return last <= cutoffDate || (neverUpdated && created <= cutoffDate);
    });

    const mapped = filtered.map(i => {
      const last = i.lastUpdated || i.createdAt;
      const daysSince = Math.floor((Date.now() - new Date(last).getTime()) / (1000*60*60*24));
      return { 
        id: i.id,
        name: i.name,
        category: i.category,
        currentStock: i.currentStock,
        minStock: i.minStock,
        unit: i.unit,
        supplier: i.supplier,
        lastUpdated: i.lastUpdated,
        lastCheckedBy: i.lastCheckedBy,
        createdAt: i.createdAt,
        tags: (i.tagRelations||[]).map(tr=>({ id: tr.tag.id, name: tr.tag.name, color: tr.tag.color })),
        daysSinceUpdate: daysSince,
        isLowStock: i.currentStock <= i.minStock
      };
    });

    const stats = { total: mapped.length, lowStock: mapped.filter(x=>x.isLowStock).length, averageDaysStale: mapped.length? Math.round(mapped.reduce((s,x)=>s+x.daysSinceUpdate,0)/mapped.length):0 };
    return NextResponse.json({ items: mapped, stats, cutoffDays: days, cutoffDate: cutoffDate.toISOString() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '조회 실패' }, { status: 500 });
  }
}


