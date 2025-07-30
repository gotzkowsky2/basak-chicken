import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || searchParams.get('q');
    const type = searchParams.get('type') || 'all';
    const tagId = searchParams.get('tagId');
    const tagIds = searchParams.getAll('tagIds'); // 여러 태그 ID 받기

    // 관리자 인증 확인
    const adminAuth = req.cookies.get("admin_auth")?.value;
    const employeeAuth = req.cookies.get("employee_auth")?.value;
    
    if (!adminAuth && !employeeAuth) {
      return NextResponse.json({ 
        error: "관리자 인증이 필요합니다." 
      }, { status: 401 });
    }

    const authId = adminAuth || employeeAuth;
    const employee = await prisma.employee.findUnique({ 
      where: { id: authId },
      select: { name: true, isSuperAdmin: true }
    });

    if (!employee || !employee.isSuperAdmin) {
      return NextResponse.json({ 
        error: "관리자 권한이 필요합니다." 
      }, { status: 403 });
    }

    // 검색어가 없으면 모든 항목 반환
    const searchTerm = query ? query.trim() : '';

    // 재고/구매관리에서 검색
    let inventoryItems: Array<{id: string, name: string}> = [];
    if (type === 'all' || type === 'inventory') {
      const whereCondition: any = {
        isActive: true
      };

      // 검색어가 있으면 검색 조건 추가
      if (searchTerm) {
        whereCondition.name = {
          contains: searchTerm,
          mode: 'insensitive' as const
        };
      }

      // 태그 필터링 추가 (AND 조건)
      if (tagIds && tagIds.length > 0) {
        // 모든 선택된 태그를 포함하는 항목만 필터링
        whereCondition.AND = tagIds.map(tagId => ({
          tagRelations: {
            some: {
              tagId: tagId
            }
          }
        }));
      } else if (tagId && tagId !== 'all') {
        // 기존 단일 태그 지원 (하위 호환성)
        whereCondition.tagRelations = {
          some: {
            tagId: tagId
          }
        };
      }
      
      inventoryItems = await prisma.inventoryItem.findMany({
        where: whereCondition,
        select: {
          id: true,
          name: true
        },
        take: 100
      });
    }

    // 주의사항에서 검색
    let precautions: Array<{id: string, title: string}> = [];
    if (type === 'all' || type === 'precaution') {
      const whereCondition: any = {
        isActive: true
      };

      // 검색어가 있으면 검색 조건 추가
      if (searchTerm) {
        whereCondition.title = {
          contains: searchTerm,
          mode: 'insensitive' as const
        };
      }

      // 태그 필터링 추가 (AND 조건)
      if (tagIds && tagIds.length > 0) {
        // 모든 선택된 태그를 포함하는 항목만 필터링
        whereCondition.AND = tagIds.map(tagId => ({
          tagRelations: {
            some: {
              tagId: tagId
            }
          }
        }));
      } else if (tagId && tagId !== 'all') {
        // 기존 단일 태그 지원 (하위 호환성)
        whereCondition.tagRelations = {
          some: {
            tagId: tagId
          }
        };
      }
      
      precautions = await prisma.precaution.findMany({
        where: whereCondition,
        select: {
          id: true,
          title: true
        },
        take: 100
      });
    }

    // 메뉴얼에서 검색
    let manuals: Array<{id: string, title: string}> = [];
    if (type === 'all' || type === 'manual') {
      const whereCondition: any = {
        isActive: true
      };

      // 검색어가 있으면 검색 조건 추가
      if (searchTerm) {
        whereCondition.title = {
          contains: searchTerm,
          mode: 'insensitive' as const
        };
      }

      // 태그 필터링 추가 (AND 조건)
      if (tagIds && tagIds.length > 0) {
        // 모든 선택된 태그를 포함하는 항목만 필터링
        whereCondition.AND = tagIds.map(tagId => ({
          tagRelations: {
            some: {
              tagId: tagId
            }
          }
        }));
      } else if (tagId && tagId !== 'all') {
        // 기존 단일 태그 지원 (하위 호환성)
        whereCondition.tagRelations = {
          some: {
            tagId: tagId
          }
        };
      }
      
      manuals = await prisma.manual.findMany({
        where: whereCondition,
        select: {
          id: true,
          title: true
        },
        take: 100
      });
    }

    // 결과 합치기
    const results = [
      ...inventoryItems.map(item => ({
        type: 'inventory' as const,
        id: item.id,
        name: item.name
      })),
      ...precautions.map(item => ({
        type: 'precaution' as const,
        id: item.id,
        name: item.title
      })),
      ...manuals.map(item => ({
        type: 'manual' as const,
        id: item.id,
        name: item.title
      }))
    ];

    console.log(`검색 결과: 재고 ${inventoryItems.length}개, 주의사항 ${precautions.length}개, 메뉴얼 ${manuals.length}개`);

    return NextResponse.json({ 
      results: results
    });

  } catch (error) {
    console.error('검색 오류:', error);
    return NextResponse.json({ 
      error: "검색 중 오류가 발생했습니다." 
    }, { status: 500 });
  }
} 