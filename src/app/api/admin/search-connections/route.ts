import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tags = searchParams.get('tags'); // 여러 태그를 쉼표로 구분
    const tagArray = tags ? tags.split(',').map(t => t.trim()) : [];

    let items: any[] = [];

    // 카테고리별로 검색
    if (category === 'INGREDIENTS' || category === 'SUPPLIES') {
      // 재고 아이템 검색
      let whereClause: any = { isActive: true };
      
      if (category) {
        whereClause.category = category;
      }

      const inventoryItems = await prisma.inventoryItem.findMany({
        where: whereClause
      });

      // 태그 필터링 (일단 태그 없이 모든 항목 반환)
      items.push(...inventoryItems.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        content: `${item.currentStock} ${item.unit} (최소: ${item.minStock} ${item.unit})`,
        type: 'inventory'
      })));
    }

    if (category === 'PRECAUTIONS') {
      // 주의사항 검색
      const precautions = await prisma.precaution.findMany({
        where: { isActive: true }
      });

      // 태그 필터링 (일단 태그 없이 모든 항목 반환)
      items.push(...precautions.map(item => ({
        id: item.id,
        title: item.title,
        category: 'PRECAUTIONS',
        content: item.content,
        type: 'precaution'
      })));
    }

    if (category === 'MANUALS') {
      // 메뉴얼 검색
      const manuals = await prisma.manual.findMany({
        where: { isActive: true }
      });

      // 태그 필터링 (일단 태그 없이 모든 항목 반환)
      items.push(...manuals.map(item => ({
        id: item.id,
        title: item.title,
        category: 'MANUALS',
        content: item.content,
        type: 'manual'
      })));
    }

    // 카테고리가 지정되지 않은 경우 모든 항목 검색
    if (!category) {
      // 재고 아이템
      const inventoryItems = await prisma.inventoryItem.findMany({
        where: { isActive: true }
      });

      // 주의사항
      const precautions = await prisma.precaution.findMany({
        where: { isActive: true }
      });

      // 메뉴얼
      const manuals = await prisma.manual.findMany({
        where: { isActive: true }
      });

      let allItems = [
        ...inventoryItems.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          content: `${item.currentStock} ${item.unit} (최소: ${item.minStock} ${item.unit})`,
          type: 'inventory'
        })),
        ...precautions.map(item => ({
          id: item.id,
          title: item.title,
          category: 'PRECAUTIONS',
          content: item.content,
          type: 'precaution'
        })),
        ...manuals.map(item => ({
          id: item.id,
          title: item.title,
          category: 'MANUALS',
          content: item.content,
          type: 'manual'
        }))
      ];

      items = allItems;
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error('검색 오류:', error);
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 