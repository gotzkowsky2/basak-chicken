import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { sourceTemplateId, newName, includeItems = true, includeConnections = true } = await req.json();

    if (!sourceTemplateId || !newName) {
      return NextResponse.json({ error: '원본 템플릿과 새 이름이 필요합니다.' }, { status: 400 });
    }

    // 인증(관리자) 확인
    const adminAuth = req.cookies.get('admin_auth')?.value;
    const employeeAuth = req.cookies.get('employee_auth')?.value;
    if (!adminAuth && !employeeAuth) {
      return NextResponse.json({ error: '관리자 인증이 필요합니다.' }, { status: 401 });
    }

    const authId = adminAuth || employeeAuth;
    const employee = await prisma.employee.findUnique({ where: { id: authId }, select: { name: true, isSuperAdmin: true } });
    if (!employee || (!adminAuth && !employee.isSuperAdmin)) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    // 원본 템플릿과 하위 항목/연결 조회
    const source = await prisma.checklistTemplate.findUnique({
      where: { id: sourceTemplateId },
      include: {
        items: {
          include: { connectedItems: true, children: { include: { connectedItems: true } } },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!source) {
      return NextResponse.json({ error: '원본 템플릿을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 새 템플릿 생성
    const newTemplate = await prisma.checklistTemplate.create({
      data: {
        name: newName,
        content: source.content,
        workplace: source.workplace,
        category: source.category,
        timeSlot: source.timeSlot,
        isActive: source.isActive,
        inputter: employee.name,
        inputDate: new Date()
      }
    });

    if (includeItems && source.items && source.items.length > 0) {
      // 원본 item id -> 신규 item id 매핑 보관
      const idMap = new Map<string, string>();

      // 1차: 루트 아이템만 생성
      for (const item of source.items.filter(i => !i.parentId)) {
        const created = await prisma.checklistItem.create({
          data: {
            templateId: newTemplate.id,
            content: item.content,
            order: item.order
          }
        });
        idMap.set(item.id, created.id);
      }

      // 2차: 자식 아이템 생성(있다면)
      for (const parent of source.items.filter(i => !i.parentId)) {
        const parentNewId = idMap.get(parent.id)!;
        for (const child of parent.children || []) {
          const created = await prisma.checklistItem.create({
            data: {
              templateId: newTemplate.id,
              parentId: parentNewId,
              content: child.content,
              order: child.order
            }
          });
          idMap.set(child.id, created.id);
        }
      }

      if (includeConnections) {
        // 연결 항목 복사 (부모와 자식 모두)
        for (const item of source.items) {
          const newItemId = idMap.get(item.id);
          if (!newItemId) continue;
          for (const conn of item.connectedItems || []) {
            await prisma.checklistItemConnection.create({
              data: {
                checklistItemId: newItemId,
                itemType: conn.itemType,
                itemId: conn.itemId,
                order: conn.order ?? 0
              }
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true, template: newTemplate });
  } catch (error) {
    console.error('템플릿 복사 오류:', error);
    return NextResponse.json({ error: '템플릿 복사 중 오류가 발생했습니다.' }, { status: 500 });
  }
}


