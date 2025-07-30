import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const runtime = "nodejs";

// GET: 템플릿 상세 정보 조회
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      select: { isSuperAdmin: true }
    });

    if (!employee || !employee.isSuperAdmin) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const { id: templateId } = await params;

    // 템플릿 조회
    const template = await prisma.checklistTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json({ error: "템플릿을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("템플릿 조회 오류:", error);
    return NextResponse.json({ error: "템플릿 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// 체크리스트 수정
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { content, workplace, category, timeSlot, isActive, selectedTags } = await req.json();
    const { id: checklistId } = await params;

    // 관리자 인증 확인
    const adminAuth = req.cookies.get("admin_auth")?.value;
    const employeeAuth = req.cookies.get("employee_auth")?.value;

    if (!adminAuth && !employeeAuth) {
      return NextResponse.json({ error: "인증 정보가 없습니다." }, { status: 401 });
    }

    const authId = adminAuth || employeeAuth;
    const employee = await prisma.employee.findUnique({
      where: { id: authId },
      select: { id: true, name: true, isSuperAdmin: true }
    });

    if (!employee || (!employee.isSuperAdmin && !adminAuth)) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    // enum 값 검증
    const validWorkplaces = ['HALL', 'KITCHEN', 'COMMON'];
    const validCategories = ['CHECKLIST', 'PRECAUTIONS', 'HYGIENE', 'SUPPLIES', 'INGREDIENTS', 'COMMON', 'MANUAL'];
    const validTimeSlots = ['PREPARATION', 'IN_PROGRESS', 'CLOSING', 'COMMON'];

    if (!validWorkplaces.includes(workplace)) {
      return NextResponse.json({ error: `유효하지 않은 근무지입니다: ${workplace}` }, { status: 400 });
    }
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: `유효하지 않은 구분입니다: ${category}` }, { status: 400 });
    }
    if (!validTimeSlots.includes(timeSlot)) {
      return NextResponse.json({ error: `유효하지 않은 시간대입니다: ${timeSlot}` }, { status: 400 });
    }

    // 체크리스트 존재 확인
    const existingChecklist = await prisma.checklistTemplate.findUnique({
      where: { id: checklistId }
    });

    if (!existingChecklist) {
      return NextResponse.json({ error: "체크리스트를 찾을 수 없습니다." }, { status: 404 });
    }

    // 기존 태그 관계 삭제
    await prisma.checklistTemplateTagRelation.deleteMany({
      where: { templateId: checklistId }
    });

    // 체크리스트 수정
    const updatedChecklist = await prisma.checklistTemplate.update({
      where: { id: checklistId },
      data: {
        content,
        workplace,
        category,
        timeSlot,
        isActive: isActive !== undefined ? isActive : existingChecklist.isActive,
        inputter: employee.name,
        inputDate: new Date(),
      },
    });

    // 새로운 태그 관계 생성 (선택된 태그가 있는 경우)
    if (selectedTags && selectedTags.length > 0) {
      await prisma.checklistTemplateTagRelation.createMany({
        data: selectedTags.map((tagId: string) => ({
          templateId: checklistId,
          tagId: tagId,
        })),
      });
    }

    return NextResponse.json({ success: true, checklist: updatedChecklist });
  } catch (error) {
    console.error("체크리스트 수정 오류:", error);
    return NextResponse.json({ error: "체크리스트 수정 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// 체크리스트 삭제 (실제 삭제 대신 isActive를 false로 설정)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: checklistId } = await params;

    // 관리자 인증 확인
    const adminAuth = req.cookies.get("admin_auth")?.value;
    const employeeAuth = req.cookies.get("employee_auth")?.value;

    if (!adminAuth && !employeeAuth) {
      return NextResponse.json({ error: "인증 정보가 없습니다." }, { status: 401 });
    }

    const authId = adminAuth || employeeAuth;
    const employee = await prisma.employee.findUnique({
      where: { id: authId },
      select: { isSuperAdmin: true }
    });

    if (!employee || !employee.isSuperAdmin) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    // 체크리스트 존재 확인
    const existingChecklist = await prisma.checklistTemplate.findUnique({
      where: { id: checklistId }
    });

    if (!existingChecklist) {
      return NextResponse.json({ error: "체크리스트를 찾을 수 없습니다." }, { status: 404 });
    }

    // 체크리스트 비활성화
    await prisma.checklistTemplate.update({
      where: { id: checklistId },
      data: { isActive: false }
    });

    return NextResponse.json({ success: true, message: "체크리스트가 성공적으로 삭제되었습니다." });
  } catch (error) {
    console.error("체크리스트 삭제 오류:", error);
    return NextResponse.json({ error: "체크리스트 삭제 중 오류가 발생했습니다." }, { status: 500 });
  }
} 