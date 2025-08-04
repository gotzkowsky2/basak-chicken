import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workplace = searchParams.get('workplace');
    const timeSlot = searchParams.get('timeSlot');
    const category = searchParams.get('category');

    // 직원 인증 확인
    const employeeAuth = req.cookies.get("employee_auth")?.value;
    if (!employeeAuth) {
      return NextResponse.json({ 
        error: "직원 인증이 필요합니다." 
      }, { status: 401 });
    }

    const employee = await prisma.employee.findUnique({ 
      where: { id: employeeAuth },
      select: { id: true, name: true, department: true }
    });

    if (!employee) {
      return NextResponse.json({ 
        error: "직원 정보를 찾을 수 없습니다." 
      }, { status: 404 });
    }

    // 필터 조건 구성
    const whereClause: any = {
      isActive: true,
      AND: []
    };

    // 카테고리 필터 추가
    if (category) {
      whereClause.category = category;
    } else {
      // 카테고리가 지정되지 않은 경우 기본값으로 체크리스트만 표시
      whereClause.category = 'CHECKLIST';
    }

    // 근무지 필터 추가
    if (workplace === 'COMMON') {
      // 공통을 선택한 경우 COMMON 근무지만 표시
      whereClause.AND.push({ workplace: 'COMMON' });
    } else if (workplace && workplace !== 'COMMON') {
      // 특정 근무지를 선택한 경우 해당 근무지만 표시 (공통 제외)
      whereClause.AND.push({ workplace });
    } else {
      // 근무지가 선택되지 않은 경우 모든 근무지 포함
      whereClause.AND.push({
        OR: [
          { workplace: 'COMMON' },
          { workplace: 'HALL' },
          { workplace: 'KITCHEN' }
        ]
      });
    }

    // 시간대 필터 추가
    if (timeSlot === 'COMMON') {
      // 공통을 선택한 경우 COMMON 시간대만 표시
      whereClause.AND.push({ timeSlot: 'COMMON' });
    } else if (timeSlot && timeSlot !== 'COMMON') {
      // 특정 시간대를 선택한 경우 해당 시간대만 표시 (공통 제외)
      whereClause.AND.push({ timeSlot });
    } else {
      // 시간대가 선택되지 않은 경우 모든 시간대 포함
      whereClause.AND.push({
        OR: [
          { timeSlot: 'COMMON' },
          { timeSlot: 'PREPARATION' },
          { timeSlot: 'IN_PROGRESS' },
          { timeSlot: 'CLOSING' }
        ]
      });
    }

    console.log("필터 조건:", { workplace, timeSlot, category });
    console.log("WHERE 절:", JSON.stringify(whereClause, null, 2));

    // 체크리스트 템플릿 조회 (연결된 항목들 포함)
    const checklists = await prisma.checklistTemplate.findMany({
      where: whereClause,
      include: {
        items: {
          orderBy: { order: 'asc' },
          include: {
            connectedItems: {
              orderBy: { order: 'asc' }
            }
          }
        },
        tagRelations: {
          include: {
            tag: true
          }
        }
      },
      orderBy: [
        { category: 'asc' },
        { createdAt: 'desc' }
      ],
    });

    console.log("조회된 체크리스트 수:", checklists.length);
    console.log("조회된 체크리스트:", checklists.map(c => ({ content: c.content, workplace: c.workplace, timeSlot: c.timeSlot })));

    return NextResponse.json({ 
      checklists,
      employee: {
        id: employee.id,
        name: employee.name,
        department: employee.department
      }
    });

  } catch (error) {
    console.error("체크리스트 조회 오류:", error);
    return NextResponse.json({ 
      error: "체크리스트 조회 중 오류가 발생했습니다." 
    }, { status: 500 });
  }
} 