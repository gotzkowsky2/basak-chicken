import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers';

async function verifyEmployee() {
  const store = await cookies();
  const token = store.get('employee_auth')?.value || store.get('__Host-employee_auth')?.value;
  if (!token) throw new Error('직원 인증이 필요합니다.');
  const employee = await prisma.employee.findUnique({ where: { id: token }, select: { id: true, name: true } });
  if (!employee) throw new Error('유효하지 않은 직원 세션입니다.');
  return employee;
}

export async function GET(request: NextRequest) {
  try {
    await verifyEmployee();
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '2');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const items = await prisma.inventoryItem.findMany({
      where: { isActive: true, OR: [{ lastUpdated: { lte: cutoffDate } }, { createdAt: { lte: cutoffDate } }] },
      orderBy: [{ lastUpdated: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, name: true, category: true, currentStock: true, minStock: true, unit: true, supplier: true, lastUpdated: true, lastCheckedBy: true, createdAt: true, tagRelations: { include: { tag: true } } },
    });

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


