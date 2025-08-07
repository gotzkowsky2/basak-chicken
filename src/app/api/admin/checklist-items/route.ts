import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const runtime = "nodejs";

// 체크리스트 항목 생성
export async function POST(req: NextRequest) {
  try {
    const { 
      templateId, 
      type, 
      content, 
      instructions, 
      order, 
      isRequired, 
      inventoryItemId, 
      precautionIds, 
      manualIds 
    } = await req.json();
    
    // 필수 필드 검증
    if (!templateId || !type || !content) {
      return NextResponse.json({ 
        error: "템플릿 ID, 타입, 내용은 필수입니다." 
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
      select: { isSuperAdmin: true }
    });

    if (!employee || !employee.isSuperAdmin) {
      return NextResponse.json({ 
        error: "관리자 권한이 필요합니다." 
      }, { status: 403 });
    }

    // 템플릿 존재 확인
    const template = await prisma.checklistTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      return NextResponse.json({ 
        error: "존재하지 않는 체크리스트 템플릿입니다." 
      }, { status: 404 });
    }

    // 체크리스트 항목 생성
    const checklistItem = await prisma.checklistItem.create({
      data: {
        templateId,
        type,
        content,
        instructions,
        order: order || 0,
        isRequired: isRequired !== false, // 기본값 true
        isActive: true,
      },
    });

    // 재고 항목 연결
    if (inventoryItemId) {
      await prisma.checklistItemConnection.create({
        data: {
          checklistItemId: checklistItem.id,
          itemType: "inventory",
          itemId: inventoryItemId,
          order: 0,
        },
      });
    }

    // 주의사항 연결
    if (precautionIds && precautionIds.length > 0) {
      for (const precautionId of precautionIds) {
        await prisma.checklistItemConnection.create({
          data: {
            checklistItemId: checklistItem.id,
            itemType: "precaution",
            itemId: precautionId,
            order: 0,
          },
        });
      }
    }

    // 메뉴얼 연결
    if (manualIds && manualIds.length > 0) {
      for (const manualId of manualIds) {
        await prisma.checklistItemConnection.create({
          data: {
            checklistItemId: checklistItem.id,
            itemType: "manual",
            itemId: manualId,
            order: 0,
          },
        });
      }
    }

    // 생성된 항목을 관계와 함께 조회
    const createdItem = await prisma.checklistItem.findUnique({
      where: { id: checklistItem.id },
      include: {
        connectedItems: {
          orderBy: { order: 'asc' }
        },
      }
    });

    return NextResponse.json({ 
      success: true, 
      checklistItem: createdItem 
    });

  } catch (error) {
    console.error("체크리스트 항목 생성 오류:", error);
    return NextResponse.json({ 
      error: `체크리스트 항목 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}

// 체크리스트 항목 목록 조회
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get('templateId');

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

    // 쿼리 조건 설정
    const where: any = { isActive: true };
    if (templateId) {
      where.templateId = templateId;
    }

    // 체크리스트 항목 목록 조회
    const checklistItems = await prisma.checklistItem.findMany({
      where,
      include: {
        connectedItems: {
          orderBy: { order: 'asc' }
        },
        template: {
          select: {
            content: true,
            workplace: true,
            category: true,
            timeSlot: true,
          }
        }
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' }
      ],
    });

    return NextResponse.json({ checklistItems });

  } catch (error) {
    console.error("체크리스트 항목 목록 조회 오류:", error);
    return NextResponse.json({ 
      error: `체크리스트 항목 목록 조회 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}

// 체크리스트 항목 수정
export async function PUT(req: NextRequest) {
  try {
    const { 
      id, 
      type, 
      content, 
      instructions, 
      order, 
      isRequired, 
      inventoryItemId, 
      precautionIds, 
      manualIds 
    } = await req.json();
    
    // 필수 필드 검증
    if (!id || !type || !content) {
      return NextResponse.json({ 
        error: "ID, 타입, 내용은 필수입니다." 
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
      select: { isSuperAdmin: true }
    });

    if (!employee || !employee.isSuperAdmin) {
      return NextResponse.json({ 
        error: "관리자 권한이 필요합니다." 
      }, { status: 403 });
    }

    // 기존 항목 존재 확인
    const existingItem = await prisma.checklistItem.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return NextResponse.json({ 
        error: "존재하지 않는 체크리스트 항목입니다." 
      }, { status: 404 });
    }

    // 체크리스트 항목 수정
    const updatedItem = await prisma.checklistItem.update({
      where: { id },
      data: {
        type,
        content,
        instructions,
        order: order || 0,
        isRequired: isRequired !== false,
      },
    });

    // 기존 연결 항목들 삭제
    await prisma.checklistItemConnection.deleteMany({
      where: { checklistItemId: id }
    });

    // 재고 항목 연결
    if (inventoryItemId) {
      await prisma.checklistItemConnection.create({
        data: {
          checklistItemId: id,
          itemType: "inventory",
          itemId: inventoryItemId,
          order: 0,
        },
      });
    }

    // 주의사항 연결
    if (precautionIds && precautionIds.length > 0) {
      for (const precautionId of precautionIds) {
        await prisma.checklistItemConnection.create({
          data: {
            checklistItemId: id,
            itemType: "precaution",
            itemId: precautionId,
            order: 0,
          },
        });
      }
    }

    // 메뉴얼 연결
    if (manualIds && manualIds.length > 0) {
      for (const manualId of manualIds) {
        await prisma.checklistItemConnection.create({
          data: {
            checklistItemId: id,
            itemType: "manual",
            itemId: manualId,
            order: 0,
          },
        });
      }
    }

    // 수정된 항목을 관계와 함께 조회
    const finalItem = await prisma.checklistItem.findUnique({
      where: { id },
      include: {
        connectedItems: {
          orderBy: { order: 'asc' }
        },
      }
    });

    return NextResponse.json({ 
      success: true, 
      checklistItem: finalItem 
    });

  } catch (error) {
    console.error("체크리스트 항목 수정 오류:", error);
    return NextResponse.json({ 
      error: `체크리스트 항목 수정 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}

// 체크리스트 항목 삭제 (실제 삭제)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        error: "삭제할 항목 ID가 필요합니다." 
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
      select: { isSuperAdmin: true }
    });

    if (!employee || !employee.isSuperAdmin) {
      return NextResponse.json({ 
        error: "관리자 권한이 필요합니다." 
      }, { status: 403 });
    }

    // 기존 항목 존재 확인
    const existingItem = await prisma.checklistItem.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return NextResponse.json({ 
        error: "존재하지 않는 체크리스트 항목입니다." 
      }, { status: 404 });
    }

    // 연결된 항목 관계 삭제
    await prisma.checklistItemConnection.deleteMany({
      where: { itemId: id }
    });

    // 체크리스트 항목 실제 삭제
    await prisma.checklistItem.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true, 
      message: "체크리스트 항목이 완전히 삭제되었습니다." 
    });

  } catch (error) {
    console.error("체크리스트 항목 삭제 오류:", error);
    return NextResponse.json({ 
      error: `체크리스트 항목 삭제 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 