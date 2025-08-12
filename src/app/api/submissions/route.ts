import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { SubmissionFilter } from '@/types/submission';

const prisma = new PrismaClient();

// 간단한 IP 기반 레이트 리밋 (읽기 전용 보호)
const RATE_LIMIT_WINDOW_MS = 60_000; // 1분
const RATE_LIMIT_MAX = 60; // 분당 60회
const ipToRequestTimestamps: Map<string, number[]> = new Map();

function getClientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const ip = xff.split(',')[0]?.trim();
    if (ip) return ip;
  }
  // @ts-ignore - NextRequest may have ip in some runtimes
  return (request as any).ip || 'unknown';
}

function isRateLimited(request: NextRequest): boolean {
  const ip = getClientIp(request);
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = (ipToRequestTimestamps.get(ip) || []).filter((t) => t > windowStart);
  if (timestamps.length >= RATE_LIMIT_MAX) {
    ipToRequestTimestamps.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  ipToRequestTimestamps.set(ip, timestamps);
  return false;
}

// 쿼리 파라미터 검증 유틸
const ALLOWED_WORKPLACES = ['HALL', 'KITCHEN', 'COMMON'] as const;
const ALLOWED_TIMESLOTS = ['PREPARATION', 'IN_PROGRESS', 'CLOSING', 'COMMON'] as const;

function isValidDateYMD(value: string | null): boolean {
  if (!value) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const t = Date.parse(value);
  return !Number.isNaN(t);
}

function parseBooleanParam(value: string | null): boolean | undefined {
  if (value == null) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

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
    // 레이트 리밋 체크
    if (isRateLimited(request)) {
      return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도하세요.' }, { status: 429 });
    }

    const employee = await verifyAdminAuth(request);
    const { searchParams } = new URL(request.url);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('제출내역 조회 요청:', { employee: employee.name, isSuperAdmin: employee.isSuperAdmin });
    }

    // 필터 파라미터 파싱 + 검증
    const filter: SubmissionFilter = {};
    const employeeIdParam = searchParams.get('employeeId');
    const templateIdParam = searchParams.get('templateId');
    const dateParam = searchParams.get('date');
    const startParam = searchParams.get('startDate');
    const endParam = searchParams.get('endDate');
    const workplaceParam = searchParams.get('workplace');
    const timeSlotParam = searchParams.get('timeSlot');
    const isCompletedParam = searchParams.get('isCompleted');
    const isSubmittedParam = searchParams.get('isSubmitted');

    if (employeeIdParam) {
      if (employeeIdParam.length > 100) {
        return NextResponse.json({ error: 'employeeId 길이가 너무 깁니다.' }, { status: 400 });
      }
      filter.employeeId = employeeIdParam;
    }
    if (templateIdParam) {
      if (templateIdParam.length > 100) {
        return NextResponse.json({ error: 'templateId 길이가 너무 깁니다.' }, { status: 400 });
      }
      filter.templateId = templateIdParam;
    }
    if (dateParam) {
      if (!isValidDateYMD(dateParam)) {
        return NextResponse.json({ error: 'date 형식이 올바르지 않습니다. (YYYY-MM-DD)' }, { status: 400 });
      }
      filter.date = dateParam;
    }
    if (startParam) {
      if (!isValidDateYMD(startParam)) {
        return NextResponse.json({ error: 'startDate 형식이 올바르지 않습니다. (YYYY-MM-DD)' }, { status: 400 });
      }
      filter.startDate = startParam;
    }
    if (endParam) {
      if (!isValidDateYMD(endParam)) {
        return NextResponse.json({ error: 'endDate 형식이 올바르지 않습니다. (YYYY-MM-DD)' }, { status: 400 });
      }
      filter.endDate = endParam;
    }
    if (workplaceParam) {
      if (!ALLOWED_WORKPLACES.includes(workplaceParam as any)) {
        return NextResponse.json({ error: '허용되지 않는 workplace 값입니다.' }, { status: 400 });
      }
      filter.workplace = workplaceParam as any;
    }
    if (timeSlotParam) {
      if (!ALLOWED_TIMESLOTS.includes(timeSlotParam as any)) {
        return NextResponse.json({ error: '허용되지 않는 timeSlot 값입니다.' }, { status: 400 });
      }
      filter.timeSlot = timeSlotParam as any;
    }
    const boolCompleted = parseBooleanParam(isCompletedParam);
    if (boolCompleted !== undefined) filter.isCompleted = boolCompleted;
    else if (isCompletedParam !== null) {
      return NextResponse.json({ error: 'isCompleted 값은 true/false 여야 합니다.' }, { status: 400 });
    }
    const boolSubmitted = parseBooleanParam(isSubmittedParam);
    if (boolSubmitted !== undefined) filter.isSubmitted = boolSubmitted;
    else if (isSubmittedParam !== null) {
      return NextResponse.json({ error: 'isSubmitted 값은 true/false 여야 합니다.' }, { status: 400 });
    }

    // 관리자가 아닌 경우: 기본적으로 본인 데이터만 보이도록 강제
    if (!employee.isSuperAdmin && !searchParams.get('employeeId')) {
      filter.employeeId = employee.id;
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('적용된 필터:', filter);
    }

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
      // 직원 필터가 없는 경우: 기본으로 '내가 제출했거나 내가 체크한' 인스턴스만 노출
      const baseWhere: any = {
        ...(filter.templateId && { templateId: filter.templateId }),
        ...(filter.workplace && { workplace: filter.workplace }),
        ...(filter.timeSlot && { timeSlot: filter.timeSlot }),
        ...(filter.isCompleted !== undefined && { isCompleted: filter.isCompleted }),
        ...(filter.isSubmitted !== undefined && { isSubmitted: filter.isSubmitted }),
        ...dateFilter
      };

      if (!employee.isSuperAdmin) {
        instances = await prisma.checklistInstance.findMany({
          where: {
            ...baseWhere,
            OR: [
              { employeeId: employee.id },
              { checklistItemProgresses: { some: { completedBy: { contains: employee.name } } } },
              { connectedItemsProgress: { some: { completedBy: { contains: employee.name } } } }
            ]
          },
          include: {
            employee: { select: { id: true, name: true } },
            template: { select: { id: true, name: true, workplace: true, timeSlot: true } },
            checklistItemProgresses: {
              include: { item: { select: { id: true, content: true, order: true } } },
              orderBy: { item: { order: 'asc' } }
            },
            connectedItemsProgress: true
          },
          orderBy: [ { date: 'desc' }, { submittedAt: 'desc' } ]
        });
      } else {
        instances = await prisma.checklistInstance.findMany({
          where: baseWhere,
          include: {
            employee: { select: { id: true, name: true } },
            template: { select: { id: true, name: true, workplace: true, timeSlot: true } },
            checklistItemProgresses: {
              include: { item: { select: { id: true, content: true, order: true } } },
              orderBy: { item: { order: 'asc' } }
            },
            connectedItemsProgress: true
          },
          orderBy: [ { date: 'desc' }, { submittedAt: 'desc' } ]
        });
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`조회된 인스턴스 수: ${instances.length}`);
    }

    // 응답 데이터 변환
    const submissions = await Promise.all(instances.map(async (instance) => {
      // 템플릿의 모든 항목을 가져오기
      const templateItems = await prisma.checklistItem.findMany({
        where: { templateId: instance.templateId },
        orderBy: { order: 'asc' }
      });
      
      // 진행 상황이 있는 항목들
      const progressItems = instance.checklistItemProgresses || [];
      const connectedItems = instance.connectedItemsProgress || [];
      
      // 모든 항목을 진행 상황과 매칭
      const mainItems = templateItems.map(templateItem => {
        const progressItem = progressItems.find(p => p.itemId === templateItem.id);
        return {
          itemId: templateItem.id,
          content: templateItem.content,
          order: templateItem.order,
          isCompleted: progressItem?.isCompleted || false,
          completedAt: progressItem?.completedAt?.toISOString() || null,
          notes: progressItem?.notes || '',
          completedBy: progressItem?.completedBy || null
        };
      });
      
      // 템플릿의 모든 연결된 항목들을 가져오기
      const allConnections = await prisma.checklistItemConnection.findMany({
        where: { 
          checklistItem: { templateId: instance.templateId }
        },
        include: {
          checklistItem: {
            select: { 
              id: true,
              content: true,
              order: true
            }
          }
        },
        orderBy: {
          checklistItem: { order: 'asc' }
        }
      });

      // 연결된 항목들의 실제 정보와 관계 가져오기
      const connectedItemsWithDetails = await Promise.all(allConnections.map(async (connection) => {
        let type = connection.itemType;
        let title = '알 수 없는 항목';
        let parentItemId = connection.checklistItemId;
        
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
        
        // 진행 상황이 있는지 확인
        const progressItem = connectedItems.find(item => item.connectionId === connection.id);
        
        return {
          id: connection.id,
          parentItemId: parentItemId,
          type: type,
          title: title,
          isCompleted: progressItem?.isCompleted || false,
          completedAt: progressItem?.completedAt?.toISOString() || null,
          notes: progressItem?.notes || '',
          previousStock: progressItem?.currentStock, // currentStock이 실제로는 이전 재고를 저장
          updatedStock: progressItem?.updatedStock, // updatedStock이 실제로는 업데이트된 재고를 저장
          completedBy: progressItem?.completedBy || null
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
      if (allEmployees.size > 0 && instance.employee) {
        allEmployees.add(instance.employee.name);
        employeeCounts.set(instance.employee.name, (employeeCounts.get(instance.employee.name) || 0) + 1);
      }
      
      const collaboratingEmployees = Array.from(allEmployees).map(name => ({
        name,
        count: employeeCounts.get(name) || 0
      })).sort((a, b) => b.count - a.count);

      return {
        id: instance.id,
        employeeId: instance.employee?.id || 0,
        employeeName: instance.employee?.name || '알 수 없는 직원',
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
            content: item.content,
            isCompleted: item.isCompleted,
            completedAt: item.completedAt,
            notes: item.notes,
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