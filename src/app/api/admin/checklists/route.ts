import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const runtime = "nodejs";

// 기본 템플릿 이름 생성 함수
function generateDefaultName(workplace: string, category: string, timeSlot: string): string {
  const workplaceLabels: Record<string, string> = {
    "HALL": "홀",
    "KITCHEN": "주방", 
    "COMMON": "공통"
  };
  
  const timeSlotLabels: Record<string, string> = {
    "PREPARATION": "준비",
    "IN_PROGRESS": "진행",
    "CLOSING": "마감",
    "COMMON": "공통"
  };
  
  const workplaceLabel = workplaceLabels[workplace] || workplace;
  const timeSlotLabel = timeSlotLabels[timeSlot] || timeSlot;
  
  return `${workplaceLabel}, ${timeSlotLabel}`;
}

// POST: 새 템플릿 생성
export async function POST(req: NextRequest) {
  try {
    // 인증 확인
    const adminAuth = req.cookies.get("admin_auth")?.value;
    const employeeAuth = req.cookies.get("employee_auth")?.value;
    
    if (!adminAuth && !employeeAuth) {
      return NextResponse.json({ error: "관리자 인증이 필요합니다." }, { status: 401 });
    }

    const authId = adminAuth || employeeAuth;
    const employee = await prisma.employee.findUnique({ 
      where: { id: authId },
      select: { name: true, isSuperAdmin: true }
    });

    if (!employee) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    // admin_auth 쿠키가 있거나 최고 관리자인 경우만 허용
    if (!adminAuth && !employee.isSuperAdmin) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const { name, workplace, category, timeSlot } = await req.json();
    
    // 필수 필드 검증
    if (!workplace || !category || !timeSlot) {
      return NextResponse.json({ 
        error: "위치, 구분, 시간을 모두 입력해주세요." 
      }, { status: 400 });
    }

    // enum 값 검증
    const validWorkplaces = ['HALL', 'KITCHEN', 'COMMON'];
    const validCategories = ['CHECKLIST', 'PRECAUTIONS', 'HYGIENE', 'SUPPLIES', 'INGREDIENTS', 'COMMON', 'MANUAL'];
    const validTimeSlots = ['PREPARATION', 'IN_PROGRESS', 'CLOSING', 'COMMON'];

    if (!validWorkplaces.includes(workplace)) {
      return NextResponse.json({ 
        error: `유효하지 않은 근무지입니다: ${workplace}` 
      }, { status: 400 });
    }

    if (!validCategories.includes(category)) {
      return NextResponse.json({ 
        error: `유효하지 않은 구분입니다: ${category}` 
      }, { status: 400 });
    }

    if (!validTimeSlots.includes(timeSlot)) {
      return NextResponse.json({ 
        error: `유효하지 않은 시간대입니다: ${timeSlot}` 
      }, { status: 400 });
    }

    // 템플릿 이름 생성
    const templateName = name || generateDefaultName(workplace, category, timeSlot);

    // 체크리스트 템플릿 생성
    const checklistTemplate = await prisma.checklistTemplate.create({
      data: {
        name: templateName,
        content: "", // 빈 내용으로 시작
        inputter: employee.name,
        workplace,
        category,
        timeSlot,
        isActive: true,
      },
    });

    return NextResponse.json(checklistTemplate, { status: 201 });
  } catch (error) {
    console.error("템플릿 생성 오류:", error);
    return NextResponse.json(
      { error: "템플릿 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}

// GET: 템플릿 목록 조회
export async function GET(req: NextRequest) {
  try {
    // 인증 확인
    const adminAuth = req.cookies.get("admin_auth")?.value;
    const employeeAuth = req.cookies.get("employee_auth")?.value;
    
    if (!adminAuth && !employeeAuth) {
      return NextResponse.json({ error: "관리자 인증이 필요합니다." }, { status: 401 });
    }

// POST /api/admin/checklists/copy : 템플릿 복사 (이름과 포함여부)
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
                itemId: newItemId,
                itemType: conn.itemType,
                itemIdRef: conn.itemId // 스키마에 맞게 필드명 조정 필요시 변경
              } as any
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
    const authId = adminAuth || employeeAuth;
    const employee = await prisma.employee.findUnique({ 
      where: { id: authId },
      select: { isSuperAdmin: true }
    });

    if (!employee) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    // admin_auth 쿠키가 있거나 최고 관리자인 경우만 허용
    if (!adminAuth && !employee.isSuperAdmin) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const workplace = searchParams.get('workplace') || '';
    const category = searchParams.get('category') || '';
    const timeSlot = searchParams.get('timeSlot') || '';

    // 필터 조건 구성
    const where: any = { isActive: true };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (workplace) {
      where.workplace = workplace;
    }

    if (category) {
      where.category = category;
    }

    if (timeSlot) {
      where.timeSlot = timeSlot;
    }

    // 템플릿 목록 조회 (항목 수 포함)
    const templates = await prisma.checklistTemplate.findMany({
      where,
      orderBy: { inputDate: 'desc' },
      include: {
        items: {
          include: {
            connectedItems: true
          }
        },
        _count: {
          select: { items: true }
        }
      }
    });

    // 응답 데이터 변환
    const transformedTemplates = templates.map((template: any) => ({
      id: template.id,
      name: template.name,
      workplace: template.workplace,
      category: template.category,
      timeSlot: template.timeSlot,
      inputter: template.inputter,
      inputDate: template.inputDate,
      isActive: template.isActive,
      itemCount: template._count.items,
      items: template.items
    }));

    return NextResponse.json(transformedTemplates);
  } catch (error) {
    console.error("템플릿 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "템플릿 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
} 