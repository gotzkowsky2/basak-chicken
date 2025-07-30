import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT: 체크리스트 항목의 연결된 항목들 업데이트
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    console.log('연결 항목 업데이트 API 호출됨');
    
    // 인증 확인
    const adminAuth = request.cookies.get("admin_auth")?.value;
    const employeeAuth = request.cookies.get("employee_auth")?.value;
    
    if (!adminAuth && !employeeAuth) {
      console.log('인증 실패: 쿠키 없음');
      return NextResponse.json({ error: "관리자 인증이 필요합니다." }, { status: 401 });
    }

    const authId = adminAuth || employeeAuth;
    const employee = await prisma.employee.findUnique({ 
      where: { id: authId },
      select: { name: true, isSuperAdmin: true }
    });

    if (!employee || !employee.isSuperAdmin) {
      console.log('권한 없음:', employee);
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const { id: templateId, itemId } = await params;
    const { connectedItems } = await request.json();
    
    console.log('템플릿 ID:', templateId);
    console.log('항목 ID:', itemId);
    console.log('연결 항목들:', connectedItems);

    // 템플릿과 항목 존재 확인
    const template = await prisma.checklistTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      return NextResponse.json({ error: "템플릿을 찾을 수 없습니다." }, { status: 404 });
    }

    const checklistItem = await prisma.checklistItem.findUnique({
      where: { id: itemId }
    });

    if (!checklistItem) {
      return NextResponse.json({ error: "체크리스트 항목을 찾을 수 없습니다." }, { status: 404 });
    }

    // 기존 연결된 항목들 삭제
    await prisma.checklistItemConnection.deleteMany({
      where: { checklistItemId: itemId }
    });

    // 새로운 연결된 항목들 생성
    if (connectedItems && connectedItems.length > 0) {
      const connections = connectedItems.map((item: any, index: number) => ({
        checklistItemId: itemId,
        itemType: item.type,
        itemId: item.id,
        order: index
      }));

      console.log('생성할 연결들:', connections);
      
      await prisma.checklistItemConnection.createMany({
        data: connections
      });
      
      console.log('연결 항목 생성 완료');
    }

    return NextResponse.json({ message: "연결된 항목이 업데이트되었습니다." });
  } catch (error) {
    console.error('Error updating connected items:', error);
    return NextResponse.json({ error: "연결된 항목을 업데이트하는 중 오류가 발생했습니다." }, { status: 500 });
  }
} 