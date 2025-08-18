import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers';

async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get('admin_auth');
  
  if (!adminAuth) {
    throw new Error('관리자 인증이 필요합니다.');
  }

  const admin = await prisma.admin.findFirst({
    where: {
      id: adminAuth.value
    }
  });

  if (!admin) {
    throw new Error('유효하지 않은 관리자 세션입니다.');
  }

  return admin;
}

export async function GET(request: NextRequest) {
  try {
    // 관리자 인증 확인 (임시로 비활성화)
    // const admin = await verifyAdminAuth();
    
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: '날짜 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    // 해당 날짜의 기존 체크리스트 조회 (ChecklistInstance 사용)
    const existingSubmissions = await prisma.checklistInstance.findMany({
      where: {
        date: {
          gte: new Date(date),
          lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
        }
      },
      include: {
        template: {
          include: {
            items: {
              include: {
                connectedItems: true
              }
            }
          }
        },
        employee: true,
        connectedItemsProgress: true
      },
      orderBy: [
        { workplace: 'asc' },
        { timeSlot: 'asc' }
      ]
    });

    return NextResponse.json({
      date: date,
      existingSubmissions: existingSubmissions,
      count: existingSubmissions.length
    });

  } catch (error: any) {
    console.error('체크리스트 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '체크리스트 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 관리자 인증 확인 (임시로 비활성화)
    // const admin = await verifyAdminAuth();
    
    const body = await request.json();
    const { targetDate, templateIds } = body;

    if (!targetDate) {
      return NextResponse.json(
        { error: '날짜가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!templateIds || !Array.isArray(templateIds) || templateIds.length === 0) {
      return NextResponse.json(
        { error: '생성할 템플릿을 하나 이상 선택해주세요.' },
        { status: 400 }
      );
    }

    // 현재 로그인한 직원 찾기 (employee_auth 쿠키 사용)
    const cookieStore = await cookies();
    const employeeAuth = cookieStore.get('employee_auth');
    
    let activeEmployee;
    if (employeeAuth) {
      activeEmployee = await prisma.employee.findFirst({
        where: {
          id: employeeAuth.value,
          isActive: true
        }
      });
    }
    
    // 직원이 로그인하지 않았거나 찾을 수 없는 경우, 첫 번째 활성 직원 사용
    if (!activeEmployee) {
      activeEmployee = await prisma.employee.findFirst({
        where: {
          isActive: true
        }
      });
    }

    if (!activeEmployee) {
      return NextResponse.json(
        { error: '활성 직원을 찾을 수 없습니다.' },
        { status: 500 }
      );
    }

    // 선택된 템플릿만 조회
    const templates = await prisma.checklistTemplate.findMany({
      where: {
        id: {
          in: templateIds
        },
        isActive: true
      },
      include: {
        items: {
          where: {
            isActive: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    // 체크리스트 생성 (ChecklistInstance 사용)
    const generatedSubmissions = [];
    
    for (const template of templates) {
      // 기존 인스턴스가 있는지 확인 (템플릿+날짜 기준)
      const base = new Date(targetDate);
      const startOfDay = new Date(base.getFullYear(), base.getMonth(), base.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      const existingInstance = await prisma.checklistInstance.findFirst({
        where: {
          templateId: template.id,
          date: { gte: startOfDay, lt: endOfDay }
        }
      });

      if (existingInstance) {
        // 기존 인스턴스가 있으면 건너뛰기
        continue;
      }

      const submission = await prisma.checklistInstance.create({
        data: {
          date: new Date(targetDate),
          workplace: template.workplace,
          timeSlot: template.timeSlot,
          employeeId: activeEmployee.id,
          templateId: template.id,
          isCompleted: false,
          isSubmitted: false,
          notes: ""
        }
      });

      generatedSubmissions.push({
        id: submission.id,
        workplace: submission.workplace,
        timeSlot: submission.timeSlot,
        templateContent: template.content,
        templateName: template.name
      });
    }

    return NextResponse.json({
      message: '테스트용 체크리스트 생성 완료',
      date: targetDate,
      generatedCount: generatedSubmissions.length,
      assignedEmployee: activeEmployee.name,
      generatedSubmissions: generatedSubmissions
    });

  } catch (error: any) {
    console.error('체크리스트 생성 오류:', error);
    return NextResponse.json(
      { error: error.message || '체크리스트 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}