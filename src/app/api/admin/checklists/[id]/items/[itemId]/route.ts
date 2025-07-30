import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// DELETE: 체크리스트 항목 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    // 인증 확인
    const adminAuth = request.cookies.get("admin_auth")?.value;
    if (!adminAuth) {
      return NextResponse.json({ error: "관리자 인증이 필요합니다." }, { status: 401 });
    }

    const templateId = params.id;
    const itemId = params.itemId;

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