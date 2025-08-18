import { NextRequest, NextResponse } from "next/server";
import prisma from '@/lib/prisma'

export const runtime = "nodejs";

// 직원용 주의사항 목록 조회
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
    const id = searchParams.get('id') || searchParams.get('precautionId');
    const workplace = searchParams.get('workplace');
    const timeSlot = searchParams.get('timeSlot');
    const search = searchParams.get('search');

    // 단건 조회 지원
    if (id) {
      const p = await prisma.precaution.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          content: true,
          workplace: true,
          timeSlot: true,
          priority: true,
          createdAt: true,
          updatedAt: true,
          tagRelations: { select: { tag: { select: { id: true, name: true, color: true } } } }
        }
      });
      if (!p) {
        return NextResponse.json({ error: '주의사항을 찾을 수 없습니다.' }, { status: 404 });
      }
      const formatted = {
        ...p,
        tags: p.tagRelations.map((r: any) => ({ id: r.tag.id, name: r.tag.name, color: r.tag.color }))
      };
      return NextResponse.json({ precaution: formatted });
    }

    // 목록 조회 - 필터 조건 구성
    const where: any = {
      isActive: true
    };

    if (workplace && workplace !== 'ALL') {
      where.workplace = workplace;
    }

    if (timeSlot && timeSlot !== 'ALL') {
      where.timeSlot = timeSlot;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    const precautions = await prisma.precaution.findMany({
      where,
      select: {
        id: true,
        title: true,
        content: true,
        workplace: true,
        timeSlot: true,
        priority: true,
        createdAt: true,
        tagRelations: { select: { tag: { select: { id: true, name: true, color: true } } } }
      },
      orderBy: [ { priority: 'desc' }, { createdAt: 'desc' } ]
    });

    // 태그 데이터 구조 변환
    const formattedPrecautions = precautions.map(precaution => ({
      ...precaution,
      tags: precaution.tagRelations.map(relation => ({
        id: relation.tag.id,
        name: relation.tag.name,
        color: relation.tag.color
      }))
    }));

    return NextResponse.json({ precautions: formattedPrecautions });
  } catch (error) {
    console.error("주의사항 조회 오류:", error);
    return NextResponse.json(
      { error: `주의사항 조회 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 