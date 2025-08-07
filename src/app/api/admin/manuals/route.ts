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
    console.log('받은 데이터:', JSON.stringify(body, null, 2));
    
    const { title, content, workplace, timeSlot, category, version, mediaUrls, tags, precautions, selectedPrecautions } = body;

    // precautions 배열에서 필요한 필드만 추출
    const cleanPrecautions = precautions && Array.isArray(precautions) ? precautions.map(p => ({
      title: p.title,
      content: p.content,
      workplace: p.workplace || 'COMMON',
      timeSlot: p.timeSlot || 'COMMON',
      priority: p.priority || 1
    })) : [];
    
    console.log('정리된 precautions:', JSON.stringify(cleanPrecautions, null, 2));

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
        timeSlot: timeSlot || 'COMMON',
        category: category || 'MANUAL',
        version: version || '1.0',
        mediaUrls: mediaUrls || [],
        isActive: true
      }
    });

    // 태그 연결
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagData = tags
        .filter((tagId: string) => tagId && typeof tagId === 'string')
        .map((tagId: string) => ({
          manualId: manual.id,
          tagId: tagId,
        }));
      
      if (tagData.length > 0) {
        await prisma.manualTagRelation.createMany({
          data: tagData,
        });
      }
    }

        // 새로운 주의사항 생성 및 연결
    if (cleanPrecautions && cleanPrecautions.length > 0) {
      for (let i = 0; i < cleanPrecautions.length; i++) {
        const precaution = cleanPrecautions[i];
        if (precaution && precaution.title && precaution.content) {
          const newPrecaution = await prisma.precaution.create({
            data: {
              title: precaution.title,
              content: precaution.content,
              workplace: precaution.workplace,
              timeSlot: precaution.timeSlot,
              priority: precaution.priority,
              isActive: true
            }
          });

          // 메뉴얼과 주의사항 연결
          await prisma.manualPrecautionRelation.create({
            data: {
              manualId: manual.id,
              precautionId: newPrecaution.id,
              order: i
            }
          });
        }
      }
    }

    // 기존 주의사항 연결
    if (selectedPrecautions && Array.isArray(selectedPrecautions) && selectedPrecautions.length > 0) {
      const relationData = selectedPrecautions
        .filter((precautionId: string) => precautionId && typeof precautionId === 'string')
        .map((precautionId: string, index: number) => ({
          manualId: manual.id,
          precautionId: precautionId,
          order: (cleanPrecautions?.length || 0) + index
        }));
      
      if (relationData.length > 0) {
        await prisma.manualPrecautionRelation.createMany({
          data: relationData,
        });
      }
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
        },
        precautionRelations: {
          include: {
            precaution: {
              include: {
                tagRelations: {
                  include: {
                    tag: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
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
        order: relation.order,
        tags: relation.precaution.tagRelations.map(tagRel => ({
          id: tagRel.tag.id,
          name: tagRel.tag.name,
          color: tagRel.tag.color
        }))
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
    const { id, title, content, workplace, timeSlot, category, version, mediaUrls, tags, precautions, selectedPrecautions } = body;

    // precautions 배열에서 필요한 필드만 추출
    const cleanPrecautions = precautions && Array.isArray(precautions) ? precautions.map(p => ({
      title: p.title,
      content: p.content,
      workplace: p.workplace || 'COMMON',
      timeSlot: p.timeSlot || 'COMMON',
      priority: p.priority || 1
    })) : [];

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
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagData = tags
        .filter((tagId: string) => tagId && typeof tagId === 'string')
        .map((tagId: string) => ({
          manualId: id,
          tagId: tagId,
        }));
      
      if (tagData.length > 0) {
        await prisma.manualTagRelation.createMany({
          data: tagData,
        });
      }
    }

    // 기존 주의사항 관계 삭제
    await prisma.manualPrecautionRelation.deleteMany({
      where: { manualId: id }
    });

    // 새로운 주의사항 생성 및 연결
    if (cleanPrecautions && cleanPrecautions.length > 0) {
      for (let i = 0; i < cleanPrecautions.length; i++) {
        const precaution = cleanPrecautions[i];
        if (precaution && precaution.title && precaution.content) {
          const newPrecaution = await prisma.precaution.create({
            data: {
              title: precaution.title,
              content: precaution.content,
              workplace: precaution.workplace,
              timeSlot: precaution.timeSlot,
              priority: precaution.priority,
              isActive: true
            }
          });

          // 메뉴얼과 주의사항 연결
          await prisma.manualPrecautionRelation.create({
            data: {
              manualId: id,
              precautionId: newPrecaution.id,
              order: i
            }
          });
        }
      }
    }

    // 기존 주의사항 연결
    if (selectedPrecautions && Array.isArray(selectedPrecautions) && selectedPrecautions.length > 0) {
      const relationData = selectedPrecautions
        .filter((precautionId: string) => precautionId && typeof precautionId === 'string')
        .map((precautionId: string, index: number) => ({
          manualId: id,
          precautionId: precautionId,
          order: (cleanPrecautions?.length || 0) + index
        }));
      
      if (relationData.length > 0) {
        await prisma.manualPrecautionRelation.createMany({
          data: relationData,
        });
      }
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

// DELETE: 메뉴얼 삭제 (실제 삭제)
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

    // 관련 데이터 먼저 삭제
    await prisma.manualTagRelation.deleteMany({
      where: { manualId: id }
    });

    await prisma.manualPrecautionRelation.deleteMany({
      where: { manualId: id }
    });

    // 체크리스트 연결에서도 제거
    await prisma.checklistItemConnection.deleteMany({
      where: { 
        itemType: 'manual',
        itemId: id 
      }
    });

    // 실제 삭제
    await prisma.manual.delete({
      where: { id }
    });

    return NextResponse.json({ message: '메뉴얼이 완전히 삭제되었습니다.' });
  } catch (error: any) {
    console.error('메뉴얼 삭제 오류:', error);
    return NextResponse.json(
      { error: error.message || '메뉴얼 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 