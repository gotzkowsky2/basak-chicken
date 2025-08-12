import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const runtime = "nodejs";

// 주의사항 생성
export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get('origin');
    if (origin) {
      try {
        const host = new URL(origin).hostname;
        if (!(host.endsWith('basak-chicken.com') || host === 'localhost')) {
          return NextResponse.json({ error: '허용되지 않은 Origin입니다.' }, { status: 403 });
        }
      } catch {}
    }
    const { title, content, workplace, timeSlot, priority, tags } = await req.json();
    
    // 필수 필드 검증
    if (!title || !content || !workplace || !timeSlot) {
      return NextResponse.json({ 
        error: "제목, 내용, 근무처, 시간대는 필수입니다." 
      }, { status: 400 });
    }

    // enum 값 검증
    const validWorkplaces = ['HALL', 'KITCHEN', 'COMMON'];
    const validTimeSlots = ['PREPARATION', 'IN_PROGRESS', 'CLOSING', 'COMMON'];

    if (!validWorkplaces.includes(workplace)) {
      return NextResponse.json({ 
        error: `유효하지 않은 근무지입니다: ${workplace}` 
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
      select: { isSuperAdmin: true }
    });

    if (!employee || !employee.isSuperAdmin) {
      return NextResponse.json({ 
        error: "관리자 권한이 필요합니다." 
      }, { status: 403 });
    }

    // 주의사항 생성
    const precaution = await prisma.precaution.create({
      data: {
        title,
        content,
        workplace,
        timeSlot,
        priority: priority || 1,
        isActive: true,
      },
    });

    // 태그 연결
    if (tags && tags.length > 0) {
      await prisma.precautionTagRelation.createMany({
        data: tags.map((tagId: string) => ({
          precautionId: precaution.id,
          tagId: tagId,
        })),
      });
    }

    return NextResponse.json({ 
      success: true, 
      precaution 
    });

  } catch (error) {
    console.error("주의사항 생성 오류:", error);
    return NextResponse.json({ 
      error: `주의사항 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}

// 주의사항 목록 조회
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workplace = searchParams.get('workplace');
    const timeSlot = searchParams.get('timeSlot');
    const priority = searchParams.get('priority');

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
    if (workplace) {
      where.workplace = workplace;
    }
    if (timeSlot) {
      where.timeSlot = timeSlot;
    }
    if (priority) {
      where.priority = parseInt(priority);
    }

    // 주의사항 목록 조회
    const precautions = await prisma.precaution.findMany({
      where,
      include: {
        tagRelations: {
          include: {
            tag: true
          }
        }
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' }
      ],
    });

    // 태그 정보 변환
    const precautionsWithTags = precautions.map(precaution => ({
      ...precaution,
      tags: precaution.tagRelations.map(relation => ({
        id: relation.tag.id,
        name: relation.tag.name,
        color: relation.tag.color
      }))
    }));

    return NextResponse.json({ precautions: precautionsWithTags });

  } catch (error) {
    console.error("주의사항 목록 조회 오류:", error);
    return NextResponse.json({ 
      error: `주의사항 목록 조회 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}

// 주의사항 수정
export async function PUT(req: NextRequest) {
  try {
    const origin = req.headers.get('origin');
    if (origin) {
      try {
        const host = new URL(origin).hostname;
        if (!(host.endsWith('basak-chicken.com') || host === 'localhost')) {
          return NextResponse.json({ error: '허용되지 않은 Origin입니다.' }, { status: 403 });
        }
      } catch {}
    }
    const { id, title, content, workplace, timeSlot, priority, tags } = await req.json();
    
    // 필수 필드 검증
    if (!id || !title || !content || !workplace || !timeSlot) {
      return NextResponse.json({ 
        error: "ID, 제목, 내용, 근무처, 시간대는 필수입니다." 
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

    // 기존 주의사항 존재 확인
    const existingPrecaution = await prisma.precaution.findUnique({
      where: { id }
    });

    if (!existingPrecaution) {
      return NextResponse.json({ 
        error: "존재하지 않는 주의사항입니다." 
      }, { status: 404 });
    }

    // 기존 태그 연결 삭제
    await prisma.precautionTagRelation.deleteMany({
      where: { precautionId: id }
    });

    // 주의사항 수정
    const updatedPrecaution = await prisma.precaution.update({
      where: { id },
      data: {
        title,
        content,
        workplace,
        timeSlot,
        priority: priority || 1,
      },
    });

    // 새로운 태그 연결
    if (tags && tags.length > 0) {
      await prisma.precautionTagRelation.createMany({
        data: tags.map((tagId: string) => ({
          precautionId: id,
          tagId: tagId,
        })),
      });
    }

    return NextResponse.json({ 
      success: true, 
      precaution: updatedPrecaution 
    });

  } catch (error) {
    console.error("주의사항 수정 오류:", error);
    return NextResponse.json({ 
      error: `주의사항 수정 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}

// 주의사항 삭제 (실제 삭제)
export async function DELETE(req: NextRequest) {
  try {
    const origin = req.headers.get('origin');
    if (origin) {
      try {
        const host = new URL(origin).hostname;
        if (!(host.endsWith('basak-chicken.com') || host === 'localhost')) {
          return NextResponse.json({ error: '허용되지 않은 Origin입니다.' }, { status: 403 });
        }
      } catch {}
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        error: "삭제할 주의사항 ID가 필요합니다." 
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

    // 기존 주의사항 존재 확인
    const existingPrecaution = await prisma.precaution.findUnique({
      where: { id }
    });

    if (!existingPrecaution) {
      return NextResponse.json({ 
        error: "존재하지 않는 주의사항입니다." 
      }, { status: 404 });
    }

    // 관련 데이터 먼저 삭제
    await prisma.precautionTagRelation.deleteMany({
      where: { precautionId: id }
    });

    await prisma.manualPrecautionRelation.deleteMany({
      where: { precautionId: id }
    });

    // 체크리스트 연결에서도 제거
    await prisma.checklistItemConnection.deleteMany({
      where: { 
        itemType: 'precaution',
        itemId: id 
      }
    });

    // 주의사항 실제 삭제
    await prisma.precaution.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true, 
      message: "주의사항이 완전히 삭제되었습니다." 
    });

  } catch (error) {
    console.error("주의사항 삭제 오류:", error);
    return NextResponse.json({ 
      error: `주의사항 삭제 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 