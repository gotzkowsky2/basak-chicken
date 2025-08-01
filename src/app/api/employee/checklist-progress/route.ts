import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import nodemailer from 'nodemailer';

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
    console.log('요청 URL:', request.url);
    console.log('요청 메서드:', request.method);
    
    const employee = await verifyEmployeeAuth();
    console.log('인증된 직원:', employee);
    
    const body = await request.json();
    console.log('요청 본문:', JSON.stringify(body, null, 2));
    
    const { templateId, isCompleted, notes, connectedItemsProgress, completedBy, completedAt, sendEmail, checklistItemsProgress } = body;

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

    // 이메일 발송이 요청된 경우
    if (sendEmail && checklistItemsProgress) {
      try {
        console.log('=== 이메일 발송 시작 ===');
        console.log('templateId:', templateId);
        console.log('checklistItemsProgress:', checklistItemsProgress);
        console.log('connectedItemsProgress:', connectedItemsProgress);
        
        // 템플릿 정보 가져오기
        const templateWithItems = await prisma.checklistTemplate.findUnique({
          where: { id: templateId },
          include: {
            items: {
              include: {
                connectedItems: true
              }
            }
          }
        });

        console.log('템플릿 조회 결과:', templateWithItems ? '성공' : '실패');
        console.log('템플릿 이름:', templateWithItems?.name);
        console.log('템플릿 항목 수:', templateWithItems?.items?.length);

        if (templateWithItems) {
          // 이메일 내용 생성
          console.log('이메일 내용 생성 시작...');
          const emailContent = await generateEmailContent(templateWithItems, checklistItemsProgress, connectedItemsProgress || [], employee);
          console.log('이메일 내용 생성 완료');
          console.log('이메일 제목:', emailContent.subject);
          
          // 이메일 발송 (직원 등록 API와 동일한 방식)
          console.log('이메일 발송 시작...');
          const transporter = nodemailer.createTransport({
            host: process.env.BASAK_SMTP_HOST,
            port: Number(process.env.BASAK_SMTP_PORT),
            secure: false,
            auth: {
              user: process.env.BASAK_SMTP_USER,
              pass: process.env.BASAK_SMTP_PASS,
            },
          });
          
          await transporter.sendMail({
            from: process.env.BASAK_SMTP_FROM,
            to: 'service@kathario.de',
            subject: emailContent.subject,
            html: emailContent.html,
          });
          
          console.log('이메일 발송 완료');
          
          // 이메일 발송 성공 후 제출 완료 상태로 업데이트
          await prisma.checklistInstance.update({
            where: {
              id: instance.id
            },
            data: {
              isSubmitted: true,
              submittedAt: new Date()
            }
          });
          
          console.log('제출 완료 상태로 업데이트 완료');
        } else {
          console.error('템플릿을 찾을 수 없습니다. templateId:', templateId);
        }
      } catch (emailError) {
        console.error('이메일 발송 오류:', emailError);
        console.error('오류 스택:', emailError.stack);
        // 이메일 발송 실패해도 체크리스트 저장은 성공으로 처리
      }
    } else {
      console.log('이메일 발송 조건 불충족:');
      console.log('sendEmail:', sendEmail);
      console.log('checklistItemsProgress 존재:', !!checklistItemsProgress);
    }

    return NextResponse.json(updatedInstance);
  } catch (error: any) {
    console.error('체크리스트 진행 상태 저장 오류:', error);
    return NextResponse.json(
      { error: error.message || '진행 상태 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

async function generateEmailContent(template: any, checklistItemsProgress: any[], connectedItemsProgress: any[], employee: any) {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  // 완료된 메인 항목들
  const completedMainItems = checklistItemsProgress.map(progress => {
    const item = template.items.find((item: any) => item.id === progress.itemId);
    return {
      content: item?.content || '알 수 없는 항목',
      completedBy: progress.completedBy,
      completedAt: progress.completedAt,
      notes: progress.notes
    };
  });

  // 완료된 연결 항목들 (상세 정보 포함)
  const completedConnectedItems = connectedItemsProgress
    .filter(progress => progress.isCompleted)
    .map(async (progress) => {
      // 연결된 항목의 상세 정보 찾기
      let itemDetails = null;
      for (const item of template.items) {
        if (item.connectedItems) {
          const connectedItem = item.connectedItems.find((conn: any) => conn.id === progress.connectionId);
          if (connectedItem) {
            // 연결된 항목의 실제 상세 정보 가져오기
            let connectedItemDetails = null;
            try {
              if (connectedItem.itemType === 'inventory') {
                const inventoryItem = await prisma.inventoryItem.findUnique({
                  where: { id: connectedItem.itemId }
                });
                connectedItemDetails = {
                  title: inventoryItem?.name || '알 수 없는 재고',
                  type: '재고',
                  content: `${inventoryItem?.name || '알 수 없는 재고'} (${inventoryItem?.currentStock || 0}${inventoryItem?.unit || '개'})`
                };
              } else if (connectedItem.itemType === 'precaution') {
                const precaution = await prisma.precaution.findUnique({
                  where: { id: connectedItem.itemId }
                });
                connectedItemDetails = {
                  title: precaution?.title || '알 수 없는 주의사항',
                  type: '주의사항',
                  content: precaution?.content || '알 수 없는 주의사항'
                };
              } else if (connectedItem.itemType === 'manual') {
                const manual = await prisma.manual.findUnique({
                  where: { id: connectedItem.itemId }
                });
                connectedItemDetails = {
                  title: manual?.title || '알 수 없는 메뉴얼',
                  type: '메뉴얼',
                  content: manual?.content || '알 수 없는 메뉴얼'
                };
              }
            } catch (error) {
              console.error('연결된 항목 상세 정보 조회 오류:', error);
            }

            itemDetails = {
              parentItem: item.content,
              connectionId: progress.connectionId,
              itemType: connectedItem.itemType,
              title: connectedItemDetails?.title || '알 수 없는 항목',
              type: connectedItemDetails?.type || '알 수 없는 유형',
              content: connectedItemDetails?.content || '알 수 없는 내용',
              completedBy: progress.completedBy,
              completedAt: progress.completedAt,
              notes: progress.notes
            };
            break;
          }
        }
      }
      return itemDetails;
    });

  // Promise.all로 모든 비동기 작업 완료 대기
  const resolvedConnectedItems = await Promise.all(completedConnectedItems);
  const validConnectedItems = resolvedConnectedItems.filter(Boolean);

  // 위치와 시간대를 한글로 변환
  const getWorkplaceLabel = (workplace: string) => {
    const workplaceMap: { [key: string]: string } = {
      'HALL': '홀',
      'KITCHEN': '주방',
      'COMMON': '공통'
    };
    return workplaceMap[workplace] || workplace;
  };

  const getTimeSlotLabel = (timeSlot: string) => {
    const timeSlotMap: { [key: string]: string } = {
      'MORNING': '오전',
      'AFTERNOON': '오후',
      'EVENING': '저녁',
      'COMMON': '공통'
    };
    return timeSlotMap[timeSlot] || timeSlot;
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .section { margin-bottom: 20px; }
        .section h3 { color: #4F46E5; border-bottom: 2px solid #4F46E5; padding-bottom: 5px; }
        .item { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #4F46E5; }
        .item-title { font-weight: bold; margin-bottom: 5px; }
        .item-details { color: #666; font-size: 14px; }
        .completed-by { color: #059669; font-weight: bold; }
        .notes { background: #f0f9ff; padding: 10px; border-radius: 4px; margin-top: 5px; }
        .summary { background: #dbeafe; padding: 15px; border-radius: 5px; margin-top: 20px; }
        .type-badge { 
          display: inline-block; 
          padding: 2px 8px; 
          border-radius: 12px; 
          font-size: 12px; 
          font-weight: bold; 
          margin-left: 8px; 
        }
        .type-inventory { background: #fef3c7; color: #92400e; }
        .type-precaution { background: #fee2e2; color: #991b1b; }
        .type-manual { background: #dbeafe; color: #1e40af; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 체크리스트 제출 알림</h1>
          <p>${today}</p>
        </div>
        
        <div class="content">
          <div class="section">
            <h3>📝 체크리스트 정보</h3>
            <div class="item">
              <div class="item-title">${template.name}</div>
              <div class="item-details">위치: ${getWorkplaceLabel(template.workplace)} | 시간대: ${getTimeSlotLabel(template.timeSlot)}</div>
            </div>
          </div>

          <div class="section">
            <h3>👤 제출자 정보</h3>
            <div class="item">
              <div class="item-title">${employee.name}</div>
              <div class="item-details">부서: ${employee.department} | 이메일: ${employee.email}</div>
            </div>
          </div>

          <div class="section">
            <h3>✅ 완료된 메인 항목 (${completedMainItems.length}개)</h3>
            ${completedMainItems.map(item => `
              <div class="item">
                <div class="item-title">${item.content}</div>
                <div class="item-details">
                  <span class="completed-by">완료자: ${item.completedBy}</span> | 
                  완료시간: ${new Date(item.completedAt).toLocaleString('ko-KR')}
                </div>
                ${item.notes ? `<div class="notes">📝 메모: ${item.notes}</div>` : ''}
              </div>
            `).join('')}
          </div>

          ${validConnectedItems.length > 0 ? `
            <div class="section">
              <h3>🔗 완료된 하위 항목 (${validConnectedItems.length}개)</h3>
              ${validConnectedItems.map(item => `
                <div class="item">
                  <div class="item-title">
                    ${item.title}
                    <span class="type-badge type-${item.itemType}">${item.type}</span>
                  </div>
                  <div class="item-details">
                    <span class="completed-by">완료자: ${item.completedBy}</span> | 
                    완료시간: ${new Date(item.completedAt).toLocaleString('ko-KR')}
                  </div>
                  <div class="item-content" style="margin-top: 8px; font-size: 14px; color: #555;">
                    ${item.content}
                  </div>
                  ${item.notes ? `<div class="notes">📝 메모: ${item.notes}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div class="summary">
            <h3>📊 요약</h3>
            <p>• 총 완료된 메인 항목: ${completedMainItems.length}개</p>
            <p>• 총 완료된 하위 항목: ${validConnectedItems.length}개</p>
            <p>• 제출 시간: ${new Date().toLocaleString('ko-KR')}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject: `[체크리스트 제출] ${template.name} - ${employee.name}`,
    html: htmlContent
  };
}

async function sendEmail(emailContent: { subject: string; html: string }) {
  console.log('=== 이메일 발송 시작 ===');
  console.log('SMTP 설정:');
  console.log('Host:', process.env.BASAK_SMTP_HOST);
  console.log('Port:', process.env.BASAK_SMTP_PORT);
  console.log('User:', process.env.BASAK_SMTP_USER);
  console.log('From:', process.env.BASAK_SMTP_FROM);
  
  const transporter = nodemailer.createTransport({
    host: process.env.BASAK_SMTP_HOST,
    port: parseInt(process.env.BASAK_SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.BASAK_SMTP_USER,
      pass: process.env.BASAK_SMTP_PASS
    }
  });

  const mailOptions = {
    from: process.env.BASAK_SMTP_FROM,
    to: 'service@kathario.de',
    subject: emailContent.subject,
    html: emailContent.html
  };

  console.log('메일 옵션:', {
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject
  });

  try {
    await transporter.sendMail(mailOptions);
    console.log('이메일이 성공적으로 발송되었습니다.');
  } catch (error) {
    console.error('이메일 발송 실패:', error);
    throw error;
  }
} 