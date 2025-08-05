import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { SubmissionFilter } from '@/types/submission';

const prisma = new PrismaClient();

// 관리자 인증 확인 함수
async function verifyAdminAuth(request: NextRequest) {
  const adminAuth = request.cookies.get('admin_auth')?.value;
  const employeeAuth = request.cookies.get('employee_auth')?.value;
  
  if (!adminAuth && !employeeAuth) {
    throw new Error('인증이 필요합니다.');
  }

  const authId = adminAuth || employeeAuth;
  const employee = await prisma.employee.findUnique({ 
    where: { id: authId },
    select: { id: true, name: true, isSuperAdmin: true }
  });

  if (!employee) {
    throw new Error('인증된 사용자를 찾을 수 없습니다.');
  }

  return employee;
}

// GET: 제출내역 조회
export async function GET(request: NextRequest) {
  try {
    const employee = await verifyAdminAuth(request);
    const { searchParams } = new URL(request.url);
    
    console.log('제출내역 조회 요청:', { employee: employee.name, isSuperAdmin: employee.isSuperAdmin });
    
    // 필터 파라미터 파싱
    const filter: SubmissionFilter = {};
    if (searchParams.get('employeeId')) filter.employeeId = searchParams.get('employeeId')!;
    if (searchParams.get('date')) filter.date = searchParams.get('date')!;
    if (searchParams.get('startDate')) filter.startDate = searchParams.get('startDate')!;
    if (searchParams.get('endDate')) filter.endDate = searchParams.get('endDate')!;
    if (searchParams.get('templateId')) filter.templateId = searchParams.get('templateId')!;
    if (searchParams.get('workplace')) filter.workplace = searchParams.get('workplace')!;
    if (searchParams.get('timeSlot')) filter.timeSlot = searchParams.get('timeSlot')!;
    if (searchParams.get('isCompleted')) filter.isCompleted = searchParams.get('isCompleted') === 'true';
    if (searchParams.get('isSubmitted')) filter.isSubmitted = searchParams.get('isSubmitted') === 'true';

    // 관리자가 아닌 경우 본인 데이터만 조회 (임시로 주석 처리)
    // if (!employee.isSuperAdmin) {
    //   filter.employeeId = employee.id;
    // }

    console.log('적용된 필터:', filter);

    // 날짜 필터 처리
    const dateFilter: any = {};
    if (filter.date) {
      const targetDate = new Date(filter.date);
      dateFilter.date = {
        gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
        lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)
      };
    } else if (filter.startDate && filter.endDate) {
      dateFilter.date = {
        gte: new Date(filter.startDate),
        lte: new Date(filter.endDate)
      };
    }

    // 모든 체크리스트 인스턴스 조회 (제출된 것과 작성 중인 것 모두)
    let instances;
    
    if (filter.employeeId) {
      // 해당 직원이 제출한 템플릿들
      const submittedInstances = await prisma.checklistInstance.findMany({
        where: {
          employeeId: filter.employeeId,
          ...(filter.templateId && { templateId: filter.templateId }),
          ...(filter.workplace && { workplace: filter.workplace }),
          ...(filter.timeSlot && { timeSlot: filter.timeSlot }),
          ...(filter.isCompleted !== undefined && { isCompleted: filter.isCompleted }),
          ...(filter.isSubmitted !== undefined && { isSubmitted: filter.isSubmitted }),
          ...dateFilter
        },
        include: {
          employee: {
            select: {
              id: true,
              name: true
            }
          },
          template: {
            select: {
              id: true,
              name: true,
              workplace: true,
              timeSlot: true
            }
          },
          checklistItemProgresses: {
            include: {
              item: {
                select: {
                  id: true,
                  content: true,
                  order: true
                }
              }
            },
            orderBy: {
              item: {
                order: 'asc'
              }
            }
          },
          connectedItemsProgress: true
        },
        orderBy: [
          { date: 'desc' },
          { submittedAt: 'desc' }
        ]
      });

      // 해당 직원의 이름을 가져와서 completedBy로 검색
      const targetEmployee = await prisma.employee.findUnique({
        where: { id: filter.employeeId },
        select: { name: true }
      });

      if (!targetEmployee) {
        instances = submittedInstances;
      } else {
        // 해당 직원이 개별 항목이나 연결항목을 체크한 다른 템플릿들
        const participatedInstances = await prisma.checklistInstance.findMany({
          where: {
            employeeId: { not: filter.employeeId }, // 다른 직원이 제출한 템플릿
            ...(filter.templateId && { templateId: filter.templateId }),
            ...(filter.workplace && { workplace: filter.workplace }),
            ...(filter.timeSlot && { timeSlot: filter.timeSlot }),
            ...(filter.isCompleted !== undefined && { isCompleted: filter.isCompleted }),
            ...(filter.isSubmitted !== undefined && { isSubmitted: filter.isSubmitted }),
            ...dateFilter,
            OR: [
              {
                checklistItemProgresses: {
                  some: {
                    completedBy: {
                      contains: targetEmployee.name
                    }
                  }
                }
              },
              {
                connectedItemsProgress: {
                  some: {
                    completedBy: {
                      contains: targetEmployee.name
                    }
                  }
                }
              }
            ]
          },
          include: {
            employee: {
              select: {
                id: true,
                name: true
              }
            },
            template: {
              select: {
                id: true,
                name: true,
                workplace: true,
                timeSlot: true
              }
            },
            checklistItemProgresses: {
              include: {
                item: {
                  select: {
                    id: true,
                    content: true,
                    order: true
                  }
                }
              },
              orderBy: {
                item: {
                  order: 'asc'
                }
              }
            },
            connectedItemsProgress: true
          },
          orderBy: [
            { date: 'desc' },
            { submittedAt: 'desc' }
          ]
        });

        // 중복 제거 (같은 템플릿이 여러 번 나올 수 있음)
        const allInstances = [...submittedInstances, ...participatedInstances];
        const uniqueInstances = allInstances.filter((instance, index, self) => 
          index === self.findIndex(i => i.id === instance.id)
        );
        
        instances = uniqueInstances;
      }
    } else {
      // 직원 필터가 없는 경우 기존 로직 사용
      const whereClause: any = {
        ...(filter.templateId && { templateId: filter.templateId }),
        ...(filter.workplace && { workplace: filter.workplace }),
        ...(filter.timeSlot && { timeSlot: filter.timeSlot }),
        ...(filter.isCompleted !== undefined && { isCompleted: filter.isCompleted }),
        ...(filter.isSubmitted !== undefined && { isSubmitted: filter.isSubmitted }),
        ...dateFilter
      };

      instances = await prisma.checklistInstance.findMany({
        where: whereClause,
        include: {
          employee: {
            select: {
              id: true,
              name: true
            }
          },
          template: {
            select: {
              id: true,
              name: true,
              workplace: true,
              timeSlot: true
            }
          },
          checklistItemProgresses: {
            include: {
              item: {
                select: {
                  id: true,
                  content: true,
                  order: true
                }
              }
            },
            orderBy: {
              item: {
                order: 'asc'
              }
            }
          },
          connectedItemsProgress: true
        },
        orderBy: [
          { date: 'desc' },
          { submittedAt: 'desc' }
        ]
      });
    }

    console.log(`조회된 인스턴스 수: ${instances.length}`);

    // 응답 데이터 변환
    const submissions = await Promise.all(instances.map(async (instance) => {
      const mainItems = instance.checklistItemProgresses || [];
      const connectedItems = instance.connectedItemsProgress || [];
      
      // 연결된 항목들의 실제 정보와 관계 가져오기
      const connectedItemsWithDetails = await Promise.all(connectedItems.map(async (item) => {
        let type = 'inventory';
        let title = '알 수 없는 항목';
        let parentItemId = null;
        
        if (item.connectionId) {
          // ChecklistItemConnection을 통해 연결된 항목 정보 조회
          const connection = await prisma.checklistItemConnection.findUnique({
            where: { id: item.connectionId },
            include: {
              checklistItem: {
                select: { 
                  id: true,
                  content: true,
                  order: true
                }
              }
            }
          });
          
          if (connection) {
            type = connection.itemType;
            parentItemId = connection.checklistItemId;
            
            // itemType에 따라 실제 항목 정보 조회
            if (connection.itemType === 'inventory') {
              const inventoryItem = await prisma.inventoryItem.findUnique({
                where: { id: connection.itemId },
                select: { name: true, unit: true }
              });
              title = inventoryItem ? `${inventoryItem.name} (${inventoryItem.unit})` : '알 수 없는 재고';
            } else if (connection.itemType === 'precaution') {
              const precaution = await prisma.precaution.findUnique({
                where: { id: connection.itemId },
                select: { title: true }
              });
              title = precaution ? precaution.title : '알 수 없는 주의사항';
            } else if (connection.itemType === 'manual') {
              const manual = await prisma.manual.findUnique({
                where: { id: connection.itemId },
                select: { title: true }
              });
              title = manual ? manual.title : '알 수 없는 메뉴얼';
            }
          }
        }
        
        return {
          id: item.connectionId || item.id,
          parentItemId: parentItemId,
          type: type,
          title: title,
          isCompleted: item.isCompleted,
          completedAt: item.completedAt?.toISOString() || null,
          notes: item.notes || '',
          previousStock: item.currentStock,
          updatedStock: item.updatedStock,
          completedBy: item.completedBy
        };
      }));
      
      // 함께 작업한 직원들 정보 수집
      const allEmployees = new Set<string>();
      const employeeCounts = new Map<string, number>();
      
      // 메인 항목 완료한 직원들
      mainItems.forEach(item => {
        if (item.completedBy) {
          allEmployees.add(item.completedBy);
          employeeCounts.set(item.completedBy, (employeeCounts.get(item.completedBy) || 0) + 1);
        }
      });
      
      // 연결된 항목 완료한 직원들
      connectedItemsWithDetails.forEach(item => {
        if (item.completedBy) {
          allEmployees.add(item.completedBy);
          employeeCounts.set(item.completedBy, (employeeCounts.get(item.completedBy) || 0) + 1);
        }
      });
      
      // 실제로 작업한 직원이 있는 경우에만 메인 작성자 포함
      // (미시작인 경우에는 메인 작성자만 표시하지 않음)
      if (allEmployees.size > 0) {
        allEmployees.add(instance.employee.name);
        employeeCounts.set(instance.employee.name, (employeeCounts.get(instance.employee.name) || 0) + 1);
      }
      
      const collaboratingEmployees = Array.from(allEmployees).map(name => ({
        name,
        count: employeeCounts.get(name) || 0
      })).sort((a, b) => b.count - a.count);

      return {
        id: instance.id,
        employeeId: instance.employee.id,
        employeeName: instance.employee.name,
        templateId: instance.template.id,
        templateName: instance.template.name,
        workplace: instance.workplace,
        timeSlot: instance.timeSlot,
        date: instance.date.toISOString().split('T')[0],
        isCompleted: instance.isCompleted,
        isSubmitted: instance.isSubmitted,
        completedAt: instance.completedAt?.toISOString() || null,
        submittedAt: instance.submittedAt?.toISOString() || null,
        collaboratingEmployees,
        progress: {
          mainItems: mainItems.filter(item => item.isCompleted).length,
          totalMainItems: mainItems.length,
          connectedItems: connectedItems.filter(item => item.isCompleted).length,
          totalConnectedItems: connectedItems.length
        },
        details: {
          mainItems: mainItems.map(item => ({
            id: item.itemId,
            content: item.item?.content || '알 수 없는 항목',
            isCompleted: item.isCompleted,
            completedAt: item.completedAt?.toISOString() || null,
            notes: item.notes || '',
            completedBy: item.completedBy
          })),
          connectedItems: connectedItemsWithDetails
        }
      };
    }));

    return NextResponse.json(submissions);
  } catch (error: any) {
    console.error('제출내역 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '제출내역 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 