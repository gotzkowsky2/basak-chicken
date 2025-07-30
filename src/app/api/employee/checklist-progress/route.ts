import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// 직원 인증 확인 함수
async function verifyEmployeeAuth() {
  const cookieStore = await cookies();
  const employeeAuth = cookieStore.get('employee_auth');
  
  if (!employeeAuth) {
    throw new Error('직원 인증이 필요합니다.');
  }

  const employee = await prisma.employee.findFirst({
    where: {
      id: employeeAuth.value
    }
  });

  if (!employee) {
    throw new Error('유효하지 않은 직원 세션입니다.');
  }

  return employee;
}

// GET: 오늘 날짜의 체크리스트 진행 상태 조회
export async function GET(request: NextRequest) {
  try {
    const employee = await verifyEmployeeAuth();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // YYYY-MM-DD 형식

    let targetDate: Date;
    if (date) {
      targetDate = new Date(date);
    } else {
      // 오늘 날짜 (시간 제외)
      const today = new Date();
      targetDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }

    const instances = await prisma.checklistInstance.findMany({
      where: {
        employeeId: employee.id,
        date: {
          gte: targetDate,
          lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000) // 다음 날 00:00
        }
      },
      include: {
        template: {
          include: {
            items: {
              include: {
                children: {
                  include: {
                    inventoryItem: true,
                    precautions: true,
                    manuals: true
                  }
                },
                inventoryItem: true,
                precautions: true,
                manuals: true
              },
              where: {
                parentId: null // 최상위 항목들만 (카테고리)
              },
              orderBy: {
                order: 'asc'
              }
            }
          }
        },
        connectedItemsProgress: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log('=== API 응답 데이터 ===');
    console.log('조회된 인스턴스 수:', instances.length);
    instances.forEach((instance, index) => {
      console.log(`인스턴스 ${index + 1}:`, {
        id: instance.id,
        templateId: instance.templateId,
        template: {
          id: instance.template.id,
          content: instance.template.content,
          itemsCount: instance.template.items?.length || 0
        }
      });
    });

    // 템플릿에 items가 없는 경우, 직접 조회
    const instancesWithItems = await Promise.all(instances.map(async (instance) => {
      if (!instance.template.items || instance.template.items.length === 0) {
        console.log(`템플릿 ${instance.templateId}에 items가 없음, 직접 조회 시도`);
        
        // 해당 템플릿의 items를 직접 조회
        const templateWithItems = await prisma.checklistTemplate.findUnique({
          where: { id: instance.templateId },
          include: {
            items: {
              include: {
                inventoryItem: true,
                precautions: true,
                manuals: true
              }
            }
          }
        });
        
        if (templateWithItems) {
          console.log(`템플릿 ${instance.templateId}에서 ${templateWithItems.items.length}개 items 조회됨`);
          return {
            ...instance,
            template: templateWithItems
          };
        }
      }
      return instance;
    }));

    return NextResponse.json(instancesWithItems);
  } catch (error: any) {
    console.error('체크리스트 진행 상태 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '진행 상태 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 체크리스트 진행 상태 저장/업데이트
export async function POST(request: NextRequest) {
  try {
    const employee = await verifyEmployeeAuth();
    const body = await request.json();
    
    const { templateId, isCompleted, notes, connectedItemsProgress } = body;

    if (!templateId) {
      return NextResponse.json(
        { error: '템플릿 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 오늘 날짜 (시간 제외)
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // 기존 인스턴스 확인
    let instance = await prisma.checklistInstance.findFirst({
      where: {
        employeeId: employee.id,
        templateId: templateId,
        date: targetDate
      },
      include: {
        connectedItemsProgress: true
      }
    });

    if (instance) {
      // 기존 인스턴스 업데이트
      instance = await prisma.checklistInstance.update({
        where: {
          id: instance.id
        },
        data: {
          isCompleted,
          notes,
          updatedAt: new Date()
        },
        include: {
          connectedItemsProgress: true
        }
      });
    } else {
      // 새로운 인스턴스 생성
      instance = await prisma.checklistInstance.create({
        data: {
          employeeId: employee.id,
          templateId,
          date: targetDate,
          workplace: 'COMMON', // 기본값, 템플릿에서 가져와야 함
          timeSlot: 'COMMON', // 기본값, 템플릿에서 가져와야 함
          isCompleted,
          notes
        },
        include: {
          connectedItemsProgress: true
        }
      });
    }

    // 연결된 항목들의 진행 상태 업데이트
    if (connectedItemsProgress && Array.isArray(connectedItemsProgress)) {
      // 기존 연결된 항목 진행 상태 삭제
      await prisma.connectedItemProgress.deleteMany({
        where: {
          instanceId: instance.id
        }
      });

      // 새로운 연결된 항목 진행 상태 생성
      if (connectedItemsProgress.length > 0) {
        await prisma.connectedItemProgress.createMany({
          data: connectedItemsProgress.map((item: any) => ({
            instanceId: instance.id,
            itemId: item.itemId,
            currentStock: item.currentStock,
            updatedStock: item.updatedStock,
            isCompleted: item.isCompleted,
            notes: item.notes
          }))
        });
      }
    }

    // 업데이트된 인스턴스 반환
    const updatedInstance = await prisma.checklistInstance.findUnique({
      where: {
        id: instance.id
      },
      include: {
        template: {
          include: {
            items: {
              include: {
                inventoryItem: true,
                precautions: true,
                manuals: true
              }
            }
          }
        },
        connectedItemsProgress: true
      }
    });

    return NextResponse.json(updatedInstance);
  } catch (error: any) {
    console.error('체크리스트 진행 상태 저장 오류:', error);
    return NextResponse.json(
      { error: error.message || '진행 상태 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 