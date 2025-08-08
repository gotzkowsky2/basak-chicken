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

    // 직원 인증 확인 (employee_auth 없으면 admin_auth 허용)
    const employeeAuth = req.cookies.get("employee_auth")?.value;
    const adminAuth = req.cookies.get("admin_auth")?.value;
    const authId = employeeAuth || adminAuth;
    if (!authId) {
      return NextResponse.json({ 
        error: "직원 인증이 필요합니다." 
      }, { status: 401 });
    }

    const employee = await prisma.employee.findUnique({ 
      where: { id: authId },
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

    if (category) {
      whereClause.category = category;
    } else {
      whereClause.category = 'CHECKLIST';
    }

    if (workplace === 'COMMON') {
      whereClause.AND.push({ workplace: 'COMMON' });
    } else if (workplace && workplace !== 'COMMON') {
      whereClause.AND.push({ workplace });
    } else {
      whereClause.AND.push({
        OR: [
          { workplace: 'COMMON' },
          { workplace: 'HALL' },
          { workplace: 'KITCHEN' }
        ]
      });
    }

    if (timeSlot === 'COMMON') {
      whereClause.AND.push({ timeSlot: 'COMMON' });
    } else if (timeSlot && timeSlot !== 'COMMON') {
      whereClause.AND.push({ timeSlot });
    } else {
      whereClause.AND.push({
        OR: [
          { timeSlot: 'COMMON' },
          { timeSlot: 'PREPARATION' },
          { timeSlot: 'IN_PROGRESS' },
          { timeSlot: 'CLOSING' }
        ]
      });
    }

    // 체크리스트 템플릿 조회
    const checklists = await prisma.checklistTemplate.findMany({
      where: whereClause,
      include: {
        items: {
          orderBy: { order: 'asc' },
          include: {
            connectedItems: { orderBy: { order: 'asc' } }
          }
        },
        tagRelations: { include: { tag: true } }
      },
      orderBy: [ { category: 'asc' }, { createdAt: 'desc' } ],
    });

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