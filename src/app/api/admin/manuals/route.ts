import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// 관리자 인증 확인 함수
async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get('admin_auth');
  const employeeAuth = cookieStore.get('employee_auth');
  
  if (!adminAuth && !employeeAuth) {
    throw new Error('관리자 인증이 필요합니다.');
  }

  const authId = adminAuth?.value || employeeAuth?.value;
  const employee = await prisma.employee.findUnique({
    where: { id: authId },
    select: { isSuperAdmin: true }
  });

  if (!employee || !employee.isSuperAdmin) {
    throw new Error('관리자 권한이 필요합니다.');
  }

  return employee;
}

// POST: 새 메뉴얼 생성
export async function POST(request: NextRequest) {
  try {
    await verifyAdminAuth();

    const body = await request.json();
    const { title, content, workplace, timeSlot, category, version, mediaUrls, tags } = body;

    // 필수 필드 검증
    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용은 필수입니다.' },
        { status: 400 }
      );
    }

    // 메뉴얼 생성
    const manual = await prisma.manual.create({
      data: {
        title,
        content,
        workplace: workplace || 'COMMON',
        timeSlot: timeSlot || 'ALL_DAY',
        category: category || 'MANUAL',
        version: version || '1.0',
        mediaUrls: mediaUrls || [],
        isActive: true
      }
    });

    // 태그 연결
    if (tags && tags.length > 0) {
      await prisma.manualTagRelation.createMany({
        data: tags.map((tagId: string) => ({
          manualId: manual.id,
          tagId: tagId,
        })),
      });
    }

    return NextResponse.json(manual, { status: 201 });
  } catch (error: any) {
    console.error('메뉴얼 생성 오류:', error);
    return NextResponse.json(
      { error: error.message || '메뉴얼 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// GET: 메뉴얼 목록 조회
export async function GET(request: NextRequest) {
  try {
    await verifyAdminAuth();

    const { searchParams } = new URL(request.url);
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

    return NextResponse.json(formattedManuals);
  } catch (error: any) {
    console.error('메뉴얼 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '메뉴얼 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT: 메뉴얼 수정
export async function PUT(request: NextRequest) {
  try {
    await verifyAdminAuth();

    const body = await request.json();
    const { id, title, content, workplace, timeSlot, category, version, mediaUrls, tags } = body;

    if (!id) {
      return NextResponse.json(
        { error: '메뉴얼 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 메뉴얼 존재 확인
    const existingManual = await prisma.manual.findFirst({
      where: { id, isActive: true }
    });

    if (!existingManual) {
      return NextResponse.json(
        { error: '존재하지 않는 메뉴얼입니다.' },
        { status: 404 }
      );
    }

    // 메뉴얼 업데이트
    const updatedManual = await prisma.manual.update({
      where: { id },
      data: {
        title: title || existingManual.title,
        content: content || existingManual.content,
        workplace: workplace || existingManual.workplace,
        timeSlot: timeSlot || existingManual.timeSlot,
        category: category || existingManual.category,
        version: version || existingManual.version,
        mediaUrls: mediaUrls !== undefined ? mediaUrls : existingManual.mediaUrls
      }
    });

    // 기존 태그 관계 삭제
    await prisma.manualTagRelation.deleteMany({
      where: { manualId: id }
    });

    // 새로운 태그 관계 생성
    if (tags && tags.length > 0) {
      await prisma.manualTagRelation.createMany({
        data: tags.map((tagId: string) => ({
          manualId: id,
          tagId: tagId,
        })),
      });
    }

    return NextResponse.json(updatedManual);
  } catch (error: any) {
    console.error('메뉴얼 수정 오류:', error);
    return NextResponse.json(
      { error: error.message || '메뉴얼 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE: 메뉴얼 삭제 (소프트 삭제)
export async function DELETE(request: NextRequest) {
  try {
    await verifyAdminAuth();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '메뉴얼 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 메뉴얼 존재 확인
    const existingManual = await prisma.manual.findFirst({
      where: { id, isActive: true }
    });

    if (!existingManual) {
      return NextResponse.json(
        { error: '존재하지 않는 메뉴얼입니다.' },
        { status: 404 }
      );
    }

    // 소프트 삭제 (isActive를 false로 설정)
    await prisma.manual.update({
      where: { id },
      data: { isActive: false }
    });

    return NextResponse.json({ message: '메뉴얼이 삭제되었습니다.' });
  } catch (error: any) {
    console.error('메뉴얼 삭제 오류:', error);
    return NextResponse.json(
      { error: error.message || '메뉴얼 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 