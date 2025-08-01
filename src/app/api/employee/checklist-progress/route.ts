import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// 직원 또는 관리자 인증 확인 함수
async function verifyEmployeeAuth() {
  const cookieStore = await cookies();
  const employeeAuth = cookieStore.get('employee_auth');
  const adminAuth = cookieStore.get('admin_auth');
  
  if (!employeeAuth && !adminAuth) {
    throw new Error('인증이 필요합니다.');
  }

  const authId = employeeAuth?.value || adminAuth?.value;
  
  // 먼저 직원으로 확인
  let employee = await prisma.employee.findFirst({
    where: {
      id: authId
    }
  });

  if (employee) {
    return employee;
  }

  // 직원이 아니면 관리자로 확인
  const admin = await prisma.admin.findFirst({
    where: {
      id: authId
    }
  });

  if (admin) {
    // 관리자인 경우 첫 번째 활성 직원 정보를 반환 (뷰어 용도)
    const firstEmployee = await prisma.employee.findFirst({
      where: {
        isActive: true
      }
    });
    
    if (firstEmployee) {
      return firstEmployee;
    }
  }

  throw new Error('유효하지 않은 세션입니다.');
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
                    connectedItems: true
                  }
                },
                connectedItems: true
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
        connectedItemsProgress: true,
        checklistItemProgresses: true
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
          name: instance.template.name,
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
                children: {
                  include: {
                    connectedItems: true
                  }
                },
                connectedItems: true
              },
              where: {
                parentId: null
              },
              orderBy: {
                order: 'asc'
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
    console.log('=== 체크리스트 진행 상태 저장 시작 ===');
    const employee = await verifyEmployeeAuth();
    console.log('인증된 직원:', employee);
    
    const body = await request.json();
    console.log('요청 본문:', JSON.stringify(body, null, 2));
    
    const { templateId, isCompleted, notes, connectedItemsProgress, completedBy, completedAt } = body;

    console.log('=== POST 요청 데이터 ===');
    console.log('templateId:', templateId);
    console.log('isCompleted:', isCompleted);
    console.log('connectedItemsProgress:', connectedItemsProgress);

    if (!templateId) {
      return NextResponse.json(
        { error: '템플릿 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 템플릿 정보 조회
    const template = await prisma.checklistTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      return NextResponse.json(
        { error: '템플릿을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    console.log('템플릿 정보:', {
      id: template.id,
      name: template.name,
      workplace: template.workplace,
      timeSlot: template.timeSlot,
      category: template.category
    });

    // 오늘 날짜 (시간 제외)
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // 기존 인스턴스 확인 (employeeId 필터링 제거)
    let instance = await prisma.checklistInstance.findFirst({
      where: {
        templateId: templateId,
        date: targetDate
      },
      include: {
        connectedItemsProgress: true
      }
    });

    console.log('기존 인스턴스:', instance);

    if (instance) {
      // 기존 인스턴스 업데이트
      const updateData: any = {
        isCompleted,
        notes,
        updatedAt: new Date()
      };
      
      // completedBy와 completedAt은 일시적으로 제거
      // if (completedBy !== undefined) {
      //   updateData.completedBy = completedBy;
      // }
      // if (completedAt !== undefined) {
      //   updateData.completedAt = completedAt ? new Date(completedAt) : null;
      // }
      
      instance = await prisma.checklistInstance.update({
        where: {
          id: instance.id
        },
        data: updateData,
        include: {
          connectedItemsProgress: true
        }
      });
    } else {
      // 새로운 인스턴스 생성
      const createData: any = {
        employeeId: employee.id,
        templateId,
        date: targetDate,
        workplace: template.workplace || 'COMMON', // 기본값 설정
        timeSlot: template.timeSlot || 'COMMON', // 기본값 설정
        isCompleted,
        notes
      };
      
      // completedBy와 completedAt은 일시적으로 제거
      // if (completedBy !== undefined) {
      //   createData.completedBy = completedBy;
      // }
      // if (completedAt !== undefined) {
      //   createData.completedAt = completedAt ? new Date(completedAt) : null;
      // }
      
      console.log('새 인스턴스 생성 데이터:', createData);
      
      instance = await prisma.checklistInstance.create({
        data: createData,
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
        const connectedItemsData = connectedItemsProgress.map((item: any) => {
          const itemData: any = {
            instanceId: instance.id,
            itemId: item.itemId,
            connectionId: item.connectionId,
            currentStock: item.currentStock,
            updatedStock: item.updatedStock,
            isCompleted: item.isCompleted,
            notes: item.notes
          };
          
          if (item.completedBy !== undefined) {
            itemData.completedBy = item.completedBy;
          }
          if (item.completedAt !== undefined) {
            itemData.completedAt = item.completedAt ? new Date(item.completedAt) : null;
          }
          
          return itemData;
        });

        console.log('연결된 항목 데이터:', connectedItemsData);
        
        await prisma.connectedItemProgress.createMany({
          data: connectedItemsData
        });
      }
    }

    // 개별 항목들의 진행 상태 업데이트
    if (body.checklistItemsProgress && Array.isArray(body.checklistItemsProgress)) {
      // 기존 개별 항목 진행 상태 삭제
      await prisma.checklistItemProgress.deleteMany({
        where: {
          instanceId: instance.id
        }
      });

      // 새로운 개별 항목 진행 상태 생성
      if (body.checklistItemsProgress.length > 0) {
        const checklistItemsData = body.checklistItemsProgress.map((item: any) => {
          const itemData: any = {
            instanceId: instance.id,
            itemId: item.itemId,
            isCompleted: item.isCompleted,
            notes: item.notes
          };
  
          if (item.completedBy !== undefined) {
            itemData.completedBy = item.completedBy;
          }
          if (item.completedAt !== undefined) {
            itemData.completedAt = item.completedAt ? new Date(item.completedAt) : null;
          }
  
          return itemData;
        });

        console.log('개별 항목 데이터:', checklistItemsData);
    
        await prisma.checklistItemProgress.createMany({
          data: checklistItemsData
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
                children: {
                  include: {
                    connectedItems: true
                  }
                },
                connectedItems: true
              }
            }
          }
        },
        connectedItemsProgress: true,
        checklistItemProgresses: true
      }
    });

    console.log('업데이트된 인스턴스:', updatedInstance);

    return NextResponse.json(updatedInstance);
  } catch (error: any) {
    console.error('체크리스트 진행 상태 저장 오류:', error);
    return NextResponse.json(
      { error: error.message || '진행 상태 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 