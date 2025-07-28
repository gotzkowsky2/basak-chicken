import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 태그가 사용 중인지 확인
    const tagUsage = await prisma.templateTagRelation.findFirst({
      where: { tagId: id }
    });
    
    if (tagUsage) {
      return NextResponse.json(
        { error: "이 태그는 사용 중이므로 삭제할 수 없습니다." },
        { status: 400 }
      );
    }
    
    // 태그 삭제
    await prisma.checklistTag.delete({
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