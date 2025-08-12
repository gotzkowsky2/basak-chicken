import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function isOriginAllowed(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    const host = new URL(origin).hostname;
    return host.endsWith('basak-chicken.com') || host === 'localhost';
  } catch {
    return false;
  }
}

// 관리자 또는 최고관리자 인증 확인 함수
async function verifyAdminAuth(request: NextRequest) {
  const superAdminAuth = request.cookies.get('superadmin_auth')?.value;
  const adminAuth = request.cookies.get('admin_auth')?.value;
  const employeeAuth = request.cookies.get('employee_auth')?.value;

  // 어떤 관리자 쿠키도 없는 경우 거부
  if (!superAdminAuth && !adminAuth) {
    throw new Error('관리자 인증이 필요합니다.');
  }

  // 최고관리자 쿠키가 있으면 최고관리자 여부 확인
  if (superAdminAuth) {
    const superAdmin = await prisma.employee.findUnique({
      where: { id: superAdminAuth },
      select: { name: true, isSuperAdmin: true },
    });
    if (!superAdmin || !superAdmin.isSuperAdmin) {
      throw new Error('최고관리자 권한이 필요합니다.');
    }
    return superAdmin;
  }

  // 일반 관리자 쿠키가 있으면 통과 (employee_auth 동기화는 미들웨어에서 처리됨)
  if (adminAuth || employeeAuth) {
    const admin = await prisma.employee.findUnique({
      where: { id: (adminAuth || employeeAuth) as string },
      select: { name: true, isSuperAdmin: true },
    });
    if (!admin) {
      throw new Error('관리자 정보를 찾을 수 없습니다.');
    }
    return admin;
  }

  throw new Error('관리자 인증이 필요합니다.');
}

// POST: 새 재고 아이템 생성
export async function POST(request: NextRequest) {
  try {
    if (!isOriginAllowed(request)) {
      return NextResponse.json({ error: '허용되지 않은 Origin입니다.' }, { status: 403 });
    }
    await verifyAdminAuth(request);

    const body = await request.json();
    const { name, category, currentStock, minStock, unit, supplier, selectedTags } = body;

    // 필수 필드 검증
    if (!name || !category || currentStock === undefined || minStock === undefined || !unit) {
      return NextResponse.json(
        { error: '이름, 카테고리, 현재재고, 최소재고, 단위는 필수입니다.' },
        { status: 400 }
      );
    }

    // 중복 이름 체크
    const existingItem = await prisma.inventoryItem.findFirst({
      where: {
        name: name.trim(),
        isActive: true
      }
    });

    if (existingItem) {
      return NextResponse.json(
        { error: `"${name}" 이름의 재고 항목이 이미 존재합니다.` },
        { status: 409 }
      );
    }

    // 재고 아이템 생성
    const inventoryItem = await prisma.inventoryItem.create({
      data: {
        name,
        category,
        currentStock: parseFloat(currentStock),
        minStock: parseFloat(minStock),
        unit,
        supplier: supplier || null,
        isActive: true
      }
    });

    // 태그 연결 (선택된 태그가 있는 경우)
    if (selectedTags && selectedTags.length > 0) {
      await prisma.inventoryItemTagRelation.createMany({
        data: selectedTags.map((tagId: string) => ({
          itemId: inventoryItem.id,
          tagId: tagId,
        })),
      });
    }

    return NextResponse.json(inventoryItem, { status: 201 });
  } catch (error: any) {
    console.error('재고 아이템 생성 오류:', error);
    return NextResponse.json(
      { error: error.message || '재고 아이템 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// GET: 재고 아이템 목록 조회
export async function GET(request: NextRequest) {
  try {
    await verifyAdminAuth(request);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const lowStock = searchParams.get('lowStock');
    const tags = searchParams.getAll('tags');
    const employeeFilter = searchParams.get('employeeId');

    // 필터 조건 구성
    const where: any = {
      isActive: true
    };

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { supplier: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (lowStock === 'true') {
      where.currentStock = {
        lte: prisma.inventoryItem.fields.minStock
      };
    }

    // 태그 필터링 (AND)
    if (tags && tags.length > 0) {
      // 모든 선택된 태그를 포함해야 함 (AND)
      where.AND = [
        ...(where.AND || []),
        ...tags.map((tagId: string) => ({
          tagRelations: {
            some: { tagId }
          }
        }))
      ];
    }

    // 직원(업데이트한 사람) 필터링
    if (employeeFilter && employeeFilter !== 'ALL') {
      // 이름 또는 ID 둘 다 허용
      where.AND = [
        ...(where.AND || []),
        {
          checks: {
            some: {
              employee: {
                OR: [
                  { id: employeeFilter },
                  { name: employeeFilter }
                ]
              }
            }
          }
        }
      ];
    }

    const inventoryItems = await prisma.inventoryItem.findMany({
      where,
      orderBy: [
        { name: 'asc' }
      ],
      include: {
        checks: {
          orderBy: { checkedAt: 'desc' },
          take: employeeFilter && employeeFilter !== 'ALL' ? 1 : 3,
          include: {
            employee: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        tagRelations: {
          include: {
            tag: true
          }
        }
      }
    });

    // 직원 필터가 있는 경우: 최근 업데이트(최신 체크)의 직원이 일치하는 항목만 반환
    let filtered = inventoryItems;
    if (employeeFilter && employeeFilter !== 'ALL') {
      filtered = inventoryItems.filter((item: any) => {
        const latest = item.checks && item.checks[0];
        if (!latest || !latest.employee) return false;
        return (
          latest.employee.id === employeeFilter ||
          latest.employee.name === employeeFilter
        );
      });
    }

    return NextResponse.json(filtered);
  } catch (error: any) {
    console.error('재고 아이템 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '재고 아이템 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT: 재고 아이템 수정
export async function PUT(request: NextRequest) {
  try {
    if (!isOriginAllowed(request)) {
      return NextResponse.json({ error: '허용되지 않은 Origin입니다.' }, { status: 403 });
    }
    await verifyAdminAuth(request);

    const body = await request.json();
    const { id, name, category, currentStock, minStock, unit, supplier, selectedTags } = body;

    if (!id) {
      return NextResponse.json(
        { error: '재고 아이템 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 재고 아이템 존재 확인
    const existingItem = await prisma.inventoryItem.findFirst({
      where: { id, isActive: true }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: '존재하지 않는 재고 아이템입니다.' },
        { status: 404 }
      );
    }

    // 중복 이름 체크 (자신을 제외하고)
    if (name && name !== existingItem.name) {
      const duplicateItem = await prisma.inventoryItem.findFirst({
        where: {
          name: name.trim(),
          isActive: true,
          id: { not: id }
        }
      });

      if (duplicateItem) {
        return NextResponse.json(
          { error: `"${name}" 이름의 재고 항목이 이미 존재합니다.` },
          { status: 409 }
        );
      }
    }

    // 재고 아이템 업데이트
    const updatedItem = await prisma.inventoryItem.update({
      where: { id },
      data: {
        name: name || existingItem.name,
        category: category || existingItem.category,
        currentStock: currentStock !== undefined ? parseFloat(currentStock) : existingItem.currentStock,
        minStock: minStock !== undefined ? parseFloat(minStock) : existingItem.minStock,
        unit: unit || existingItem.unit,
        supplier: supplier !== undefined ? supplier : existingItem.supplier,
        lastUpdated: new Date()
      }
    });

    // 기존 태그 연결 삭제
    await prisma.inventoryItemTagRelation.deleteMany({
      where: { itemId: id }
    });

    // 새로운 태그 연결 생성
    if (selectedTags && selectedTags.length > 0) {
      await prisma.inventoryItemTagRelation.createMany({
        data: selectedTags.map((tagId: string) => ({
          itemId: id,
          tagId: tagId,
        })),
      });
    }

    return NextResponse.json(updatedItem);
  } catch (error: any) {
    console.error('재고 아이템 수정 오류:', error);
    return NextResponse.json(
      { error: error.message || '재고 아이템 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE: 재고 아이템 삭제 (실제 삭제)
export async function DELETE(request: NextRequest) {
  try {
    if (!isOriginAllowed(request)) {
      return NextResponse.json({ error: '허용되지 않은 Origin입니다.' }, { status: 403 });
    }
    await verifyAdminAuth(request);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '재고 아이템 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 재고 아이템 존재 확인
    const existingItem = await prisma.inventoryItem.findFirst({
      where: { id, isActive: true }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: '존재하지 않는 재고 아이템입니다.' },
        { status: 404 }
      );
    }

    // 관련 데이터 먼저 삭제
    await prisma.inventoryItemTagRelation.deleteMany({
      where: { itemId: id }
    });

    // 구매요청 항목에 참조된 경우도 제거
    await prisma.purchaseRequestItem.deleteMany({
      where: { itemId: id }
    });

    await prisma.inventoryCheck.deleteMany({
      where: { itemId: id }
    });

    // 체크리스트 연결에서도 제거
    await prisma.checklistItemConnection.deleteMany({
      where: { 
        itemType: 'inventory',
        itemId: id 
      }
    });

    // 실제 삭제
    await prisma.inventoryItem.delete({
      where: { id }
    });

    return NextResponse.json({ message: '재고 아이템이 완전히 삭제되었습니다.' });
  } catch (error: any) {
    console.error('재고 아이템 삭제 오류:', error);
    return NextResponse.json(
      { error: error.message || '재고 아이템 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 