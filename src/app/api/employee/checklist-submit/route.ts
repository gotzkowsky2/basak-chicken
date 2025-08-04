import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  console.log('=== 체크리스트 제출 API 호출됨 ===');
  
  try {
    const body = await request.json();
    console.log('받은 데이터:', JSON.stringify(body, null, 2));
    
    const { templateId, checklistItemsProgress, connectedItemsProgress } = body;

    console.log('템플릿 ID:', templateId);
    console.log('체크리스트 항목 진행 상태:', checklistItemsProgress);
    console.log('연결된 항목 진행 상태:', connectedItemsProgress);

    // 체크리스트 템플릿 정보 가져오기
    const template = await prisma.checklistTemplate.findUnique({
      where: { id: templateId },
      include: {
        items: {
          include: {
            connectedItems: true
          }
        }
      }
    });

    console.log('템플릿 정보:', template ? '찾음' : '없음');

    if (!template) {
      console.log('템플릿을 찾을 수 없습니다.');
      return NextResponse.json({ error: '템플릿을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 현재 직원 정보 가져오기
    console.log('직원 정보 가져오는 중...');
    const employeeResponse = await fetch(`${request.nextUrl.origin}/api/employee/me`, {
      headers: {
        'Cookie': request.headers.get('cookie') || ''
      }
    });
    
    const employee = await employeeResponse.json();
    console.log('직원 정보:', employee);

    // 이메일 내용 생성
    console.log('이메일 내용 생성 중...');
    const emailContent = generateEmailContent(template, checklistItemsProgress, connectedItemsProgress, employee);

    // 이메일 발송
    console.log('이메일 발송 시작...');
    await sendEmail(emailContent);

    console.log('체크리스트 제출 완료');
    return NextResponse.json({ success: true, message: '체크리스트가 제출되었습니다.' });
  } catch (error) {
    console.error('체크리스트 제출 오류:', error);
    console.error('오류 스택:', error instanceof Error ? error.stack : '스택 없음');
    return NextResponse.json({ error: '체크리스트 제출 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

function generateEmailContent(template: any, checklistItemsProgress: any[], connectedItemsProgress: any[], employee: any) {
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

  // 완료된 연결 항목들
  const completedConnectedItems = connectedItemsProgress
    .filter(progress => progress.isCompleted)
    .map(progress => {
      // 연결된 항목의 상세 정보 찾기
      let itemDetails = null;
      for (const item of template.items) {
        if (item.connectedItems) {
          const connectedItem = item.connectedItems.find((conn: any) => conn.id === progress.connectionId);
          if (connectedItem) {
            itemDetails = {
              parentItem: item.content,
              connectionId: progress.connectionId,
              completedBy: progress.completedBy,
              completedAt: progress.completedAt,
              notes: progress.notes
            };
            break;
          }
        }
      }
      return itemDetails;
    })
    .filter(Boolean);

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
              <div class="item-title">템플릿: ${template.name}</div>
              <div class="item-details">위치: ${template.workplace} | 시간대: ${template.timeSlot}</div>
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

          ${completedConnectedItems.length > 0 ? `
            <div class="section">
              <h3>🔗 완료된 하위 항목 (${completedConnectedItems.length}개)</h3>
              ${completedConnectedItems.filter(item => item !== null).map(item => `
                <div class="item">
                  <div class="item-title">${item.parentItem} - 하위 항목</div>
                  <div class="item-details">
                    <span class="completed-by">완료자: ${item.completedBy}</span> | 
                    완료시간: ${new Date(item.completedAt).toLocaleString('ko-KR')}
                  </div>
                  ${item.notes ? `<div class="notes">📝 메모: ${item.notes}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div class="summary">
            <h3>📊 요약</h3>
            <p>• 총 완료된 메인 항목: ${completedMainItems.length}개</p>
            <p>• 총 완료된 하위 항목: ${completedConnectedItems.length}개</p>
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