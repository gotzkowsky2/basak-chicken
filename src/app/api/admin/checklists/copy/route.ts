import { NextRequest, NextResponse } from "next/server";
import prisma from '@/lib/prisma'
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

    // 원본 템플릿과 하위 항목/연결 조회 (자식까지 포함)
    const source = await prisma.checklistTemplate.findUnique({
      where: { id: sourceTemplateId },
      include: {
        items: {
          where: { parentId: null },
          include: {
            connectedItems: true,
            children: {
              include: {
                connectedItems: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
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
        inputDate: new Date(),
      },
    });

    if (includeItems && source.items && source.items.length > 0) {
      const idMap = new Map<string, string>();

      // 재귀 복제 함수: 항목 생성 → 연결 복사 → 자식 재귀
      const cloneItemTree = async (
        item: any,
        parentNewId: string | null,
      ): Promise<void> => {
        const created = await prisma.checklistItem.create({
          data: {
            templateId: newTemplate.id,
            parentId: parentNewId,
            type: item.type ?? 'check',
            content: item.content,
            instructions: item.instructions ?? null,
            order: item.order ?? 0,
            isRequired: item.isRequired ?? true,
            isActive: item.isActive ?? true,
          },
        });
        idMap.set(item.id, created.id);

        if (includeConnections) {
          for (const conn of item.connectedItems || []) {
            await prisma.checklistItemConnection.create({
              data: {
                checklistItemId: created.id,
                itemType: conn.itemType,
                itemId: conn.itemId,
                order: conn.order ?? 0,
              },
            });
          }
        }

        if (item.children && item.children.length > 0) {
          for (const child of item.children) {
            await cloneItemTree(child, created.id);
          }
        }
      };

      // 루트부터 복제 시작
      for (const rootItem of source.items) {
        await cloneItemTree(rootItem, null);
      }
    }

    return NextResponse.json({ success: true, template: newTemplate });
  } catch (error) {
    console.error('템플릿 복사 오류:', error);
    return NextResponse.json({ error: '템플릿 복사 중 오류가 발생했습니다.' }, { status: 500 });
  }
}



