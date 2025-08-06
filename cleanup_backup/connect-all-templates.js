const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function connectAllTemplates() {
  try {
    console.log('=== 모든 템플릿에 아이템 연결 ===');
    
    // 모든 템플릿 조회
    const templates = await prisma.checklistTemplate.findMany({
      include: { items: true }
    });
    
    console.log('총 템플릿 수:', templates.length);
    templates.forEach((template, index) => {
      console.log(`${index + 1}. ${template.content} (${template.workplace}, ${template.timeSlot}) - 아이템 ${template.items.length}개`);
    });
    
    // 각 템플릿별로 연결할 아이템들 정의
    const templateItems = {
      // 홀, 준비 (이미 완료됨)
      'cmdn9pskh0002u25042ljtf8i': [
        '세척기 준비', '걸래 삶기', '소스 제자리 (영업위치로)', '휴지 , 장갑 체크',
        '냉장고 냉동고 온도 체크 및 기입', '연수기 체크 및 소금. 물 채우기', '집기류 배치',
        '밥짓기', '보관해놓은 닭 꺼내두기 (냉동고)', '재료 체크',
        '전분가루 확인', '밀가루 확인', '고추가루 확인', '염지된 윙'
      ],
      
      // 주방, 준비
      'cmdna4dfy0004u227wpxib6lt': [
        '연수기 체크 및 소금. 물 채우기', '집기류 배치', '밥짓기', '보관해놓은 닭 꺼내두기 (냉동고)',
        '재료 체크', '전분가루 확인', '밀가루 확인', '고추가루 확인', '염지된 윙',
        '주방 청소', '조리도구 준비', '가스레인지 점검', '환기 시스템 확인'
      ],
      
      // 주방, 진행
      'cmdope2n90000u2ucqd1nodqa': [
        '테스트 입력하기', '조리 진행 상황 체크', '재료 소진 확인', '품질 관리',
        '온도 관리', '위생 관리', '주방 정리', '폐기물 처리', '안전 점검'
      ]
    };
    
    // 각 템플릿에 아이템 연결
    for (const [templateId, items] of Object.entries(templateItems)) {
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        console.log(`템플릿 ID ${templateId}를 찾을 수 없습니다.`);
        continue;
      }
      
      console.log(`\n=== ${template.content} (${template.workplace}, ${template.timeSlot}) 연결 중 ===`);
      
      for (const itemContent of items) {
        let item = await prisma.checklistItem.findFirst({
          where: { content: itemContent }
        });
        
        if (!item) {
          // 아이템이 없으면 생성
          console.log(`아이템 "${itemContent}" 생성 중...`);
          item = await prisma.checklistItem.create({
            data: {
              content: itemContent,
              type: 'CHECKLIST',
              order: 0,
              isRequired: true,
              isActive: true,
              template: {
                connect: { id: templateId }
              }
            }
          });
          console.log(`✓ "${itemContent}" 생성 완료`);
        } else {
          // 아이템이 있으면 템플릿에 연결
          console.log(`아이템 "${itemContent}" 연결 중...`);
          await prisma.checklistItem.update({
            where: { id: item.id },
            data: { 
              template: {
                connect: { id: templateId }
              }
            }
          });
          console.log(`✓ "${itemContent}" 연결 완료`);
        }
      }
    }
    
    // 최종 결과 확인
    console.log('\n=== 최종 연결 결과 ===');
    const finalTemplates = await prisma.checklistTemplate.findMany({
      include: { items: true }
    });
    
    finalTemplates.forEach((template, index) => {
      console.log(`${index + 1}. ${template.content} (${template.workplace}, ${template.timeSlot})`);
      console.log(`   아이템 ${template.items.length}개:`);
      template.items.forEach((item, itemIndex) => {
        console.log(`   ${itemIndex + 1}. ${item.content}`);
      });
      console.log('');
    });
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

connectAllTemplates();