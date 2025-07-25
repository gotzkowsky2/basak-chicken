import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { workplace, timeSlot, completedItems, notes } = await req.json();
    
    // 필수 필드 검증
    if (!workplace || !timeSlot || !completedItems || !Array.isArray(completedItems)) {
      return NextResponse.json({ 
        error: "필수 정보가 누락되었습니다." 
      }, { status: 400 });
    }

    // 직원 인증 확인
    const employeeAuth = req.cookies.get("employee_auth")?.value;
    if (!employeeAuth) {
      return NextResponse.json({ 
        error: "직원 인증이 필요합니다." 
      }, { status: 401 });
    }

    const employee = await prisma.employee.findUnique({ 
      where: { id: employeeAuth },
      select: { id: true, name: true, email: true }
    });

    if (!employee) {
      return NextResponse.json({ 
        error: "직원 정보를 찾을 수 없습니다." 
      }, { status: 404 });
    }

    // 오늘 날짜의 제출 기록이 있는지 확인 (임시로 주석 처리)
    /*
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingSubmission = await prisma.checklistSubmission.findFirst({
      where: {
        employeeId: employee.id,
        workplace,
        timeSlot,
        submissionDate: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (existingSubmission) {
      return NextResponse.json({ 
        error: "오늘 이미 제출한 체크리스트가 있습니다." 
      }, { status: 400 });
    }
    */

    // 체크리스트 제출 생성
    const submission = await prisma.checklistSubmission.create({
      data: {
        employeeId: employee.id,
        templateId: completedItems[0]?.templateId || '', // 첫 번째 항목의 templateId 사용
        submissionDate: new Date(),
        workplace,
        timeSlot,
        isCompleted: true,
        notes,
      },
    });

    // 각 완료된 항목에 대한 응답 생성
    for (const item of completedItems) {
      await prisma.checklistItemResponse.create({
        data: {
          submissionId: submission.id,
          templateId: item.templateId,
          isCompleted: item.isCompleted,
          notes: item.notes,
          completedAt: item.isCompleted ? new Date() : null,
        },
      });
    }

    // 관리자에게 이메일 알림 발송
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.BASAK_SMTP_HOST,
        port: Number(process.env.BASAK_SMTP_PORT),
        secure: false,
        auth: {
          user: process.env.BASAK_SMTP_USER,
          pass: process.env.BASAK_SMTP_PASS,
        },
      });

      const workplaceText = {
        'HALL': '홀',
        'KITCHEN': '주방',
        'COMMON': '공통'
      }[workplace as 'HALL' | 'KITCHEN' | 'COMMON'] || workplace;

      const timeSlotText = {
        'PREPARATION': '준비',
        'IN_PROGRESS': '진행',
        'CLOSING': '마감',
        'COMMON': '공통'
      }[timeSlot as 'PREPARATION' | 'IN_PROGRESS' | 'CLOSING' | 'COMMON'] || timeSlot;

      // 체크리스트 항목 정보 가져오기
      const checklistDetails = await Promise.all(
        completedItems.map(async (item) => {
          const template = await prisma.checklistTemplate.findUnique({
            where: { id: item.templateId },
            select: { content: true, category: true }
          });
          return {
            content: template?.content || '알 수 없는 항목',
            category: template?.category || 'UNKNOWN',
            isCompleted: item.isCompleted,
            notes: item.notes || ''
          };
        })
      );

      const categoryLabels = {
        'CHECKLIST': '체크리스트',
        'PRECAUTIONS': '주의사항',
        'HYGIENE': '위생규정',
        'SUPPLIES': '부대용품',
        'INGREDIENTS': '재료',
        'COMMON': '공통',
        'MANUAL': '매뉴얼'
      };

      const completedCount = completedItems.filter(item => item.isCompleted).length;
      const totalCount = completedItems.length;

      await transporter.sendMail({
        from: process.env.BASAK_SMTP_FROM,
        to: "service@kathario.de", // 관리자 이메일
        subject: `[바삭치킨] 체크리스트 제출 완료 - ${employee.name}님 (${workplaceText} ${timeSlotText})`,
        html: `
          <div style="font-family: 'Pretendard', 'Apple SD Gothic Neo', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
            <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- 헤더 -->
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 48px; margin-bottom: 10px;">🍗</div>
                <h1 style="color: #d97706; margin: 0; font-size: 24px; font-weight: bold;">바삭치킨 체크리스트 제출</h1>
                <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">${new Date().toLocaleDateString('ko-KR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric', 
                  weekday: 'long' 
                })}</p>
              </div>

              <!-- 직원 정보 -->
              <div style="background: #fef3c7; border-radius: 8px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #d97706;">
                <h2 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">👤 직원 정보</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
                  <div><strong>이름:</strong> ${employee.name}</div>
                  <div><strong>근무지:</strong> ${workplaceText}</div>
                  <div><strong>시간대:</strong> ${timeSlotText}</div>
                  <div><strong>제출시간:</strong> ${new Date().toLocaleString('ko-KR')}</div>
                </div>
              </div>

              <!-- 완료 현황 -->
              <div style="background: #ecfdf5; border-radius: 8px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #10b981;">
                <h2 style="color: #065f46; margin: 0 0 15px 0; font-size: 18px;">✅ 완료 현황</h2>
                <div style="text-align: center; margin-bottom: 15px;">
                  <div style="font-size: 32px; font-weight: bold; color: #10b981;">${completedCount}/${totalCount}</div>
                  <div style="color: #6b7280; font-size: 14px;">항목 완료</div>
                </div>
                <div style="background: #d1fae5; border-radius: 6px; padding: 10px; text-align: center; font-size: 14px; color: #065f46;">
                  ${completedCount === totalCount ? '🎉 모든 항목이 완료되었습니다!' : '⚠️ 일부 항목이 미완료 상태입니다.'}
                </div>
              </div>

              <!-- 체크리스트 상세 -->
              <div style="margin-bottom: 25px;">
                <h2 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">📋 체크리스트 상세</h2>
                <div style="space-y: 10px;">
                  ${checklistDetails.map((item, index) => `
                    <div style="background: ${item.isCompleted ? '#f0fdf4' : '#fef2f2'}; border-radius: 6px; padding: 15px; margin-bottom: 10px; border-left: 4px solid ${item.isCompleted ? '#10b981' : '#ef4444'};">
                      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                        <div style="flex: 1;">
                          <div style="font-weight: 600; color: #374151; margin-bottom: 4px;">
                            ${index + 1}. ${item.content}
                          </div>
                          <div style="display: flex; gap: 10px; font-size: 12px;">
                            <span style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px; color: #6b7280;">
                              ${categoryLabels[item.category as keyof typeof categoryLabels] || item.category}
                            </span>
                            <span style="background: ${item.isCompleted ? '#d1fae5' : '#fee2e2'}; padding: 2px 6px; border-radius: 4px; color: ${item.isCompleted ? '#065f46' : '#dc2626'};">
                              ${item.isCompleted ? '✅ 완료' : '❌ 미완료'}
                            </span>
                          </div>
                        </div>
                      </div>
                      ${item.notes ? `
                        <div style="background: #f9fafb; border-radius: 4px; padding: 8px; margin-top: 8px; font-size: 13px; color: #6b7280;">
                          <strong>메모:</strong> ${item.notes}
                        </div>
                      ` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- 전체 메모 -->
              ${notes ? `
                <div style="background: #fef3c7; border-radius: 8px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #f59e0b;">
                  <h2 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">📝 전체 메모</h2>
                  <div style="color: #78350f; font-size: 14px; line-height: 1.5;">${notes}</div>
                </div>
              ` : ''}

              <!-- 푸터 -->
              <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  이 이메일은 바삭치킨 체크리스트 시스템에서 자동으로 발송되었습니다.<br>
                  관리자 페이지에서 더 자세한 내용을 확인하실 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("이메일 발송 실패:", emailError);
      // 이메일 실패는 체크리스트 제출을 막지 않음
    }

    return NextResponse.json({ 
      success: true, 
      submission 
    });

  } catch (error) {
    console.error("체크리스트 제출 오류:", error);
    return NextResponse.json({ 
      error: "체크리스트 제출 중 오류가 발생했습니다." 
    }, { status: 500 });
  }
} 