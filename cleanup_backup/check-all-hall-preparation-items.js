const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllHallPreparationItems() {
  try {
    const templateId = 'cmdn9pskh0002u25042ljtf8i'; // 홀, 준비 템플릿
    
    console.log('=== 홀, 준비 템플릿 전체 항목 확인 ===');
    
    // 현재 연결된 아이템들 확인
    const template = await prisma.checklistTemplate.findUnique({
      where: { id: templateId },
      include: { items: true }
    });
    
    console.log('현재 연결된 아이템 수:', template.items.length);
    template.items.forEach((item, index) => {
      console.log(`${index + 1}. ${item.content}`);
    });
    
    // 홀, 준비에 연결되어야 할 모든 아이템들
    const hallPreparationItems = [
      '세척기 준비',
      '걸래 삶기',
      '소스 제자리 (영업위치로)',
      '휴지 , 장갑 체크',
      '냉장고 냉동고 온도 체크 및 기입',
      '연수기 체크 및 소금. 물 채우기',
      '집기류 배치',
      '밥짓기',
      '보관해놓은 닭 꺼내두기 (냉동고)',
      '재료 체크'
    ];
    
    console.log('\n=== 연결해야 할 전체 항목들 ===');
    hallPreparationItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item}`);
    });
    
    // 각 아이템이 데이터베이스에 존재하는지 확인
    console.log('\n=== 데이터베이스 존재 여부 확인 ===');
    for (const itemContent of hallPreparationItems) {
      const item = await prisma.checklistItem.findFirst({
        where: { content: itemContent }
      });
      
      if (item) {
        console.log(`✓ "${itemContent}" - 존재함 (ID: ${item.id})`);
      } else {
        console.log(`✗ "${itemContent}" - 존재하지 않음`);
      }
    }
    
    // 누락된 아이템들을 생성하고 연결
    console.log('\n=== 누락된 아이템 생성 및 연결 ===');
    for (const itemContent of hallPreparationItems) {
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
    
    // 최종 결과 확인
    console.log('\n=== 최종 연결 결과 ===');
    const finalTemplate = await prisma.checklistTemplate.findUnique({
      where: { id: templateId },
      include: { items: true }
    });
    
    console.log('최종 연결된 아이템 수:', finalTemplate.items.length);
    finalTemplate.items.forEach((item, index) => {
      console.log(`${index + 1}. ${item.content}`);
    });
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllHallPreparationItems();