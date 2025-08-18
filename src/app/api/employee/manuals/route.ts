import { NextRequest, NextResponse } from "next/server";
import prisma from '@/lib/prisma'

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
    const manualId = searchParams.get('manualId');
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

    if (manualId) {
      const m = await prisma.manual.findUnique({
        where: { id: manualId },
        select: {
          id: true, title: true, content: true, workplace: true, timeSlot: true, category: true, version: true,
          tagRelations: { select: { tag: { select: { id: true, name: true, color: true } } } },
          precautionRelations: { select: { precaution: { select: { id: true, title: true, content: true, workplace: true, timeSlot: true, priority: true, tagRelations: { select: { tag: { select: { id: true, name: true, color: true } } } } } } } }
        }
      });
      if (!m) return NextResponse.json({ error: '메뉴얼을 찾을 수 없습니다.' }, { status: 404 });
      const fm = {
        ...m,
        tags: m.tagRelations.map((r:any)=>({ id:r.tag.id, name:r.tag.name, color:r.tag.color })),
        precautions: m.precautionRelations.map((r:any)=>({
          id: r.precaution.id,
          title: r.precaution.title,
          content: r.precaution.content,
          workplace: r.precaution.workplace,
          timeSlot: r.precaution.timeSlot,
          priority: r.precaution.priority,
          tags: r.precaution.tagRelations.map((tr:any)=>({ id: tr.tag.id, name: tr.tag.name, color: tr.tag.color }))
        }))
      };
      return NextResponse.json({ manual: fm });
    }

    const manuals = await prisma.manual.findMany({
      where,
      select: {
        id: true, title: true, content: true, workplace: true, timeSlot: true, category: true, version: true, createdAt: true,
        tagRelations: { select: { tag: { select: { id: true, name: true, color: true } } } },
        precautionRelations: { select: { precaution: { select: { id: true, title: true, content: true, workplace: true, timeSlot: true, priority: true, tagRelations: { select: { tag: { select: { id: true, name: true, color: true } } } } } } } }
      },
      orderBy: [ { createdAt: 'desc' } ]
    });

    // 태그와 주의사항 데이터 구조 변환
    const formattedManuals = manuals.map(manual => ({
      ...manual,
      tags: manual.tagRelations.map(relation => ({
        id: relation.tag.id,
        name: relation.tag.name,
        color: relation.tag.color
      })),
      precautions: manual.precautionRelations.map(relation => ({
        id: relation.precaution.id,
        title: relation.precaution.title,
        content: relation.precaution.content,
        workplace: relation.precaution.workplace,
        timeSlot: relation.precaution.timeSlot,
        priority: relation.precaution.priority,
        tags: relation.precaution.tagRelations.map(tagRel => ({
          id: tagRel.tag.id,
          name: tagRel.tag.name,
          color: tagRel.tag.color
        }))
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