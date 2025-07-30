const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function connectItemsToTemplate() {
  try {
    const templateId = 'cmdn9pskh0002u25042ljtf8i'; // 홀, 준비 템플릿
    
    console.log('=== 템플릿에 아이템 연결 ===');
    console.log('템플릿 ID:', templateId);
    
    // 연결할 아이템들 (홀, 준비에 적합한 아이템들)
    const itemsToConnect = [
      '전분가루 확인',
      '밀가루 확인', 
      '고추가루 확인',
      '염지된 윙'
    ];
    
    // 각 아이템을 템플릿에 연결
    for (const itemContent of itemsToConnect) {
      const item = await prisma.checklistItem.findFirst({
        where: { content: itemContent }
      });
      
      if (item) {
        console.log(`아이템 "${itemContent}" 연결 중...`);
        
        // 새 템플릿에 연결 (기존 연결은 자동으로 해제됨)
        await prisma.checklistItem.update({
          where: { id: item.id },
          data: { 
            template: {
              connect: { id: templateId }
            }
          }
        });
        
        console.log(`✓ "${itemContent}" 연결 완료`);
      } else {
        console.log(`✗ "${itemContent}" 아이템을 찾을 수 없음`);
      }
    }
    
    // 연결 결과 확인
    console.log('\n=== 연결 결과 확인 ===');
    const template = await prisma.checklistTemplate.findUnique({
      where: { id: templateId },
      include: { items: true }
    });
    
    if (template) {
      console.log('템플릿:', template.content);
      console.log('연결된 아이템 수:', template.items.length);
      template.items.forEach((item, index) => {
        console.log(`${index + 1}. ${item.content}`);
      });
    }
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

connectItemsToTemplate();