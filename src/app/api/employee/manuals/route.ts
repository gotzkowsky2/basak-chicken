import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const runtime = "nodejs";

// 직원용 메뉴얼 목록 조회
export async function GET(req: NextRequest) {
  try {
    // 직원 인증 확인
    const employeeAuth = req.cookies.get("employee_auth")?.value;
    
    if (!employeeAuth) {
      return NextResponse.json({ 
        error: "직원 인증이 필요합니다." 
      }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workplace = searchParams.get('workplace');
    const timeSlot = searchParams.get('timeSlot');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // 필터 조건 구성
    const where: any = {
      isActive: true
    };

    if (workplace && workplace !== 'ALL') {
      where.workplace = workplace;
    }

    if (timeSlot && timeSlot !== 'ALL') {
      where.timeSlot = timeSlot;
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    const manuals = await prisma.manual.findMany({
      where,
      include: {
        tagRelations: {
          include: {
            tag: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    // 태그 데이터 구조 변환
    const formattedManuals = manuals.map(manual => ({
      ...manual,
      tags: manual.tagRelations.map(relation => ({
        id: relation.tag.id,
        name: relation.tag.name,
        color: relation.tag.color
      }))
    }));

    return NextResponse.json({ manuals: formattedManuals });
  } catch (error) {
    console.error("메뉴얼 조회 오류:", error);
    return NextResponse.json(
      { error: `메뉴얼 조회 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 