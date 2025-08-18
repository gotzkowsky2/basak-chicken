import { NextRequest, NextResponse } from "next/server";
import prisma from '@/lib/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, color } = await req.json();

    if (!name && !color) {
      return NextResponse.json(
        { error: "수정할 항목이 없습니다." },
        { status: 400 }
      );
    }

    // 이름 변경 시 중복 확인
    if (name && name.trim() !== "") {
      const existing = await prisma.tag.findUnique({ where: { name: name.trim() } });
      if (existing && existing.id !== id) {
        return NextResponse.json(
          { error: "이미 존재하는 태그 이름입니다." },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.tag.update({
      where: { id },
      data: {
        ...(name && name.trim() !== "" ? { name: name.trim() } : {}),
        ...(color ? { color } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("태그 수정 오류:", error);
    return NextResponse.json(
      { error: "태그 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 태그 사용 여부 확인
    const tagUsage = await prisma.checklistTemplateTagRelation.findFirst({
      where: { tagId: id }
    });
    
    if (tagUsage) {
      return NextResponse.json(
        { error: "이 태그는 사용 중이므로 삭제할 수 없습니다." },
        { status: 400 }
      );
    }
    
    // 태그 삭제
    await prisma.tag.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: "태그가 삭제되었습니다." });
  } catch (error) {
    console.error("태그 삭제 오류:", error);
    return NextResponse.json(
      { error: "태그 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 