import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 태그 목록 조회
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim().toLowerCase();
    const tags = await prisma.tag.findMany({
      where: q ? { name: { contains: q, mode: 'insensitive' } } : undefined,
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(tags);
  } catch (error) {
    console.error("태그 조회 오류:", error);
    return NextResponse.json(
      { error: "태그 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 새 태그 생성
export async function POST(req: NextRequest) {
  try {
    const { name, color } = await req.json();
    
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "태그 이름은 필수입니다." },
        { status: 400 }
      );
    }
    
    const existingTag = await prisma.tag.findUnique({
      where: { name: name.trim() }
    });
    
    if (existingTag) {
      return NextResponse.json(
        { error: "이미 존재하는 태그 이름입니다." },
        { status: 400 }
      );
    }
    
    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        color: color || "#3B82F6" // 기본 파란색
      }
    });
    
    return NextResponse.json(tag);
  } catch (error) {
    console.error("태그 생성 오류:", error);
    return NextResponse.json(
      { error: "태그 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 