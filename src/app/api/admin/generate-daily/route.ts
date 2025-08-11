import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const runtime = "nodejs";

function parseDateOnly(value?: string | null): Date {
  const now = new Date();
  if (!value) {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  const d = new Date(value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// POST: 일일 체크리스트 자동 생성(반복 설정 기반)
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date'); // YYYY-MM-DD 허용
    const targetDate = parseDateOnly(dateParam);
    const weekday = targetDate.getDay(); // 0(일)~6(토)

    // 반복 설정이 해당 요일에 포함된 템플릿만 대상
    const templates = await prisma.checklistTemplate.findMany({
      where: {
        isActive: true,
        autoGenerateEnabled: true,
        recurrenceDays: { has: weekday }
      }
    });

    let created = 0;
    const results: Array<{ templateId: string; status: 'created'|'skipped'; reason?: string }> = [];

    for (const tpl of templates) {
      try {
        // 중복 존재 여부 검사 (고유 제약과 중복 방지로 2중 보호)
        const exists = await prisma.checklistInstance.findUnique({
          where: {
            templateId_date: {
              templateId: tpl.id,
              date: targetDate
            }
          }
        });
        if (exists) {
          results.push({ templateId: tpl.id, status: 'skipped', reason: 'already exists' });
          continue;
        }

        await prisma.checklistInstance.create({
          data: {
            date: targetDate,
            workplace: tpl.workplace,
            timeSlot: tpl.timeSlot,
            templateId: tpl.id,
            isCompleted: false,
            isSubmitted: false,
            notes: ''
          }
        });
        created += 1;
        results.push({ templateId: tpl.id, status: 'created' });
      } catch (e: any) {
        results.push({ templateId: tpl.id, status: 'skipped', reason: e?.message || 'error' });
      }
    }

    return NextResponse.json({
      date: targetDate.toISOString().slice(0,10),
      weekday,
      totalTemplates: templates.length,
      created,
      results
    });
  } catch (error: any) {
    console.error('generate-daily error', error);
    return NextResponse.json({ error: error.message || 'failed' }, { status: 500 });
  }
}


