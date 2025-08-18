import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'

// DELETE: 체크리스트 항목 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const resolvedParams = await params;
  try {
    // 인증 확인 (최신/레거시 쿠키 허용)
    const cookieOrder = ['__Host-admin_auth', 'admin_auth'];
    let authId: string | undefined;
    for (const name of cookieOrder) {
      const v = request.cookies.get(name)?.value;
      if (v) { authId = v; break; }
    }
    if (!authId) {
      return NextResponse.json({ error: "관리자 인증이 필요합니다." }, { status: 401 });
    }

    const templateId = resolvedParams.id;
    const itemId = resolvedParams.itemId;

    // 템플릿 존재 확인
    const template = await prisma.checklistTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      return NextResponse.json({ error: "템플릿을 찾을 수 없습니다." }, { status: 404 });
    }

    // 항목 존재 확인
    const item = await prisma.checklistItem.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      return NextResponse.json({ error: "체크리스트 항목을 찾을 수 없습니다." }, { status: 404 });
    }

    // 연결된 항목들 먼저 삭제
    await prisma.checklistItemConnection.deleteMany({
      where: { checklistItemId: itemId }
    });

    // 항목 삭제
    await prisma.checklistItem.delete({
      where: { id: itemId }
    });

    // 삭제된 항목 이후의 항목들의 order 재정렬
    await prisma.checklistItem.updateMany({
      where: {
        templateId,
        order: { gt: item.order }
      },
      data: {
        order: { decrement: 1 }
      }
    });

    return NextResponse.json({ message: "항목이 성공적으로 삭제되었습니다." });
  } catch (error) {
    console.error('Error deleting checklist item:', error);
    return NextResponse.json({ error: "항목 삭제에 실패했습니다." }, { status: 500 });
  }
} 

// PUT: 체크리스트 항목 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    // 인증 확인 (최신/레거시 쿠키 허용)
    const cookieOrder = ['__Host-admin_auth', 'admin_auth'];
    let authId: string | undefined;
    for (const name of cookieOrder) {
      const v = request.cookies.get(name)?.value;
      if (v) { authId = v; break; }
    }
    if (!authId) {
      return NextResponse.json({ error: '관리자 인증이 필요합니다.' }, { status: 401 });
    }

    const { id: templateId, itemId } = await params;
    const body = await request.json();
    const { content, instructions, isRequired, isActive, order } = body ?? {};

    // 템플릿 및 항목 존재 확인
    const template = await prisma.checklistTemplate.findUnique({ where: { id: templateId } });
    if (!template) {
      return NextResponse.json({ error: '템플릿을 찾을 수 없습니다.' }, { status: 404 });
    }
    const item = await prisma.checklistItem.findUnique({ where: { id: itemId } });
    if (!item) {
      return NextResponse.json({ error: '체크리스트 항목을 찾을 수 없습니다.' }, { status: 404 });
    }

    const data: any = {};
    if (typeof content === 'string') data.content = content;
    if (typeof instructions === 'string' || instructions === null) data.instructions = instructions ?? null;
    if (typeof isRequired === 'boolean') data.isRequired = isRequired;
    if (typeof isActive === 'boolean') data.isActive = isActive;
    if (typeof order === 'number') data.order = order;

    const updated = await prisma.checklistItem.update({ where: { id: itemId }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating checklist item:', error);
    return NextResponse.json({ error: '체크리스트 항목 수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}