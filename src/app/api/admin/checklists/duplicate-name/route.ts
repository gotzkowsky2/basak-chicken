import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    const excludeId = searchParams.get('excludeId'); // 수정 모드에서 제외할 ID

    if (!name) {
      return NextResponse.json({ error: '템플릿 이름이 필요합니다.' }, { status: 400 });
    }

    // 동일한 이름의 템플릿이 있는지 확인 (수정 모드에서는 현재 ID 제외)
    const existingTemplate = await prisma.checklistTemplate.findFirst({
      where: {
        name: name.trim(),
        isActive: true, // 활성화된 템플릿만 확인
        ...(excludeId && { id: { not: excludeId } }) // 수정 모드에서는 현재 ID 제외
      }
    });

    return NextResponse.json({
      isDuplicate: !!existingTemplate,
      existingTemplate: existingTemplate ? {
        id: existingTemplate.id,
        name: existingTemplate.name,
        workplace: existingTemplate.workplace,
        timeSlot: existingTemplate.timeSlot
      } : null
    });

  } catch (error) {
    console.error('템플릿 이름 중복 검사 오류:', error);
    return NextResponse.json(
      { error: '템플릿 이름 중복 검사 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 