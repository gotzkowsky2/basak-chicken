import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const runtime = "nodejs";

async function verifyAdmin(req: NextRequest) {
  const adminAuth = req.cookies.get("admin_auth")?.value;
  const employeeAuth = req.cookies.get("employee_auth")?.value;
  if (!adminAuth && !employeeAuth) {
    return null;
  }
  const authId = adminAuth || employeeAuth;
  const employee = await prisma.employee.findUnique({ where: { id: authId }, select: { isSuperAdmin: true } });
  if (!employee || !employee.isSuperAdmin) return null;
  return true;
}

function parseDateOnly(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// GET: 특정 날짜의 인스턴스 목록 조회 ?date=YYYY-MM-DD (없으면 오늘)
export async function GET(req: NextRequest) {
  try {
    if (!(await verifyAdmin(req))) return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const base = parseDateOnly(dateParam) ?? new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    const nextDay = new Date(base.getTime() + 24*60*60*1000);

    const instances = await prisma.checklistInstance.findMany({
      where: { date: { gte: base, lt: nextDay } },
      orderBy: [{ workplace: 'asc' }, { timeSlot: 'asc' }],
      include: {
        template: { select: { id: true, name: true, workplace: true, timeSlot: true } }
      }
    });

    return NextResponse.json({ date: base.toISOString().slice(0,10), count: instances.length, instances });
  } catch (e: any) {
    console.error('admin checklist-instances GET error', e);
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}

// DELETE: id 로 삭제 ?id=...
export async function DELETE(req: NextRequest) {
  try {
    if (!(await verifyAdmin(req))) return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id가 필요합니다.' }, { status: 400 });

    // 존재 확인
    const exists = await prisma.checklistInstance.findUnique({ where: { id } });
    if (!exists) return NextResponse.json({ error: '해당 인스턴스를 찾을 수 없습니다.' }, { status: 404 });

    await prisma.checklistInstance.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('admin checklist-instances DELETE error', e);
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}


