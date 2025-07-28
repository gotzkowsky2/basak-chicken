import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { content, workplace, category, timeSlot, selectedTags } = await req.json();
    
    // 필수 필드 검증
    if (!content || !workplace || !category || !timeSlot) {
      return NextResponse.json({ 
        error: "모든 필드를 입력해주세요." 
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

    // 관리자 인증 확인
    const adminAuth = req.cookies.get("admin_auth")?.value;
    const employeeAuth = req.cookies.get("employee_auth")?.value;
    
    if (!adminAuth && !employeeAuth) {
      return NextResponse.json({ 
        error: "관리자 인증이 필요합니다." 
      }, { status: 401 });
    }

    const authId = adminAuth || employeeAuth;
    const employee = await prisma.employee.findUnique({ 
      where: { id: authId },
      select: { name: true, isSuperAdmin: true }
    });

    if (!employee || !employee.isSuperAdmin) {
      return NextResponse.json({ 
        error: "관리자 권한이 필요합니다." 
      }, { status: 403 });
    }

    // 체크리스트 템플릿 생성
    const checklistTemplate = await prisma.checklistTemplate.create({
      data: {
        content,
        inputter: employee.name,
        workplace,
        category,
        timeSlot,
        isActive: true,
      },
    });

    // 태그 연결 (선택된 태그가 있는 경우)
    if (selectedTags && selectedTags.length > 0) {
      await prisma.checklistTemplateTagRelation.createMany({
        data: selectedTags.map((tagId: string) => ({
          templateId: checklistTemplate.id,
          tagId: tagId,
        })),
      });
    }

    return NextResponse.json({ 
      success: true, 
      checklistTemplate 
    });

  } catch (error) {
    console.error("체크리스트 등록 오류:", error);
    return NextResponse.json({ 
      error: `체크리스트 등록 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // 관리자 인증 확인
    const adminAuth = req.cookies.get("admin_auth")?.value;
    const employeeAuth = req.cookies.get("employee_auth")?.value;
    
    if (!adminAuth && !employeeAuth) {
      return NextResponse.json({ 
        error: "관리자 인증이 필요합니다." 
      }, { status: 401 });
    }

    const authId = adminAuth || employeeAuth;
    const employee = await prisma.employee.findUnique({ 
      where: { id: authId },
      select: { isSuperAdmin: true }
    });

    if (!employee || !employee.isSuperAdmin) {
      return NextResponse.json({ 
        error: "관리자 권한이 필요합니다." 
      }, { status: 403 });
    }

    // 체크리스트 템플릿 목록 조회
    const checklists = await prisma.checklistTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    // 각 체크리스트에 대한 태그 정보와 항목들 조회
    const checklistsWithTagsAndItems = await Promise.all(
      checklists.map(async (checklist) => {
        const tagRelations = await prisma.checklistTemplateTagRelation.findMany({
          where: { templateId: checklist.id },
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                color: true,
              }
            }
          }
        });

        // 체크리스트 항목들 조회
        const items = await prisma.checklistItem.findMany({
          where: { 
            templateId: checklist.id,
            isActive: true 
          },
          include: {
            inventoryItem: true,
            precautions: true,
            manuals: true,
          },
          orderBy: { order: 'asc' }
        });

        return {
          ...checklist,
          tags: tagRelations.map(relation => relation.tag),
          items: items
        };
      })
    );

    return NextResponse.json({ checklists: checklistsWithTagsAndItems });

  } catch (error) {
    console.error("체크리스트 목록 조회 오류:", error);
    console.error("오류 상세:", error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ 
      error: `체크리스트 목록 조회 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 