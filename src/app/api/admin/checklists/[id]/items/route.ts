import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'

// GET: 템플릿의 체크리스트 항목들 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 인증 확인
    const adminAuth = request.cookies.get("admin_auth")?.value;
    const employeeAuth = request.cookies.get("employee_auth")?.value;
    
    if (!adminAuth && !employeeAuth) {
      return NextResponse.json({ error: "관리자 인증이 필요합니다." }, { status: 401 });
    }

    const resolvedParams = await params;
    const templateId = resolvedParams.id;

    // 템플릿 존재 확인
    const template = await prisma.checklistTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      return NextResponse.json({ error: "템플릿을 찾을 수 없습니다." }, { status: 404 });
    }

    // 체크리스트 항목들 조회 (연결된 항목들 포함)
    const items = await prisma.checklistItem.findMany({
      where: { 
        templateId: templateId,
        parentId: null // 최상위 항목들만
      },
      include: {
        connectedItems: {
          include: {
            // 연결된 항목의 실제 데이터는 별도로 조회해야 함
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    // 연결된 항목들의 실제 데이터 조회
    const itemsWithConnections = await Promise.all(
      items.map(async (item) => {
        const connectedItems = await Promise.all(
          item.connectedItems.map(async (connection) => {
            let connectedItem = null;
            
            switch (connection.itemType) {
              case 'inventory':
                connectedItem = await prisma.inventoryItem.findUnique({
                  where: { id: connection.itemId },
                  include: { tags: true }
                });
                break;
              case 'precaution':
                connectedItem = await prisma.precaution.findUnique({
                  where: { id: connection.itemId },
                  include: { tags: true }
                });
                break;
              case 'manual':
                connectedItem = await prisma.manual.findUnique({
                  where: { id: connection.itemId },
                  include: { tags: true }
                });
                break;
            }

            return {
              id: connection.id,
              itemType: connection.itemType,
              itemId: connection.itemId,
              order: connection.order,
              connectedItem: connectedItem ? {
                id: connectedItem.id,
                name: 'name' in connectedItem ? connectedItem.name : connectedItem.title,
                type: connection.itemType,
                tags: connectedItem.tags.map(tag => tag.name)
              } : null
            };
          })
        );

        return {
          id: item.id,
          content: item.content,
          instructions: item.instructions,
          order: item.order,
          isRequired: item.isRequired,
          isActive: item.isActive,
          connectedItems: connectedItems.filter(ci => ci.connectedItem !== null)
        };
      })
    );

    return NextResponse.json(itemsWithConnections);
  } catch (error) {
    console.error('Error fetching checklist items:', error);
    return NextResponse.json({ error: "체크리스트 항목을 조회하는 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// POST: 새로운 체크리스트 항목 추가
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 인증 확인
    const adminAuth = request.cookies.get("admin_auth")?.value;
    const employeeAuth = request.cookies.get("employee_auth")?.value;
    
    if (!adminAuth && !employeeAuth) {
      return NextResponse.json({ error: "관리자 인증이 필요합니다." }, { status: 401 });
    }

    const { id: templateId } = await params;
    const { content, instructions, isRequired = true } = await request.json();

    // 템플릿 존재 확인
    const template = await prisma.checklistTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      return NextResponse.json({ error: "템플릿을 찾을 수 없습니다." }, { status: 404 });
    }

    // 현재 최대 order 값 조회
    const maxOrder = await prisma.checklistItem.aggregate({
      where: { templateId: templateId },
      _max: { order: true }
    });

    const newOrder = (maxOrder._max.order || 0) + 1;

    // 새로운 체크리스트 항목 생성
    const newItem = await prisma.checklistItem.create({
      data: {
        templateId: templateId,
        type: 'check',
        content: content,
        instructions: instructions,
        order: newOrder,
        isRequired: isRequired,
        isActive: true
      }
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error creating checklist item:', error);
    return NextResponse.json({ error: "체크리스트 항목을 생성하는 중 오류가 발생했습니다." }, { status: 500 });
  }
} 