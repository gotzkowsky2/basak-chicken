const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function simpleCleanup() {
  try {
    console.log('데이터베이스 정리를 시작합니다...');
    
    // 비활성화된 데이터 삭제
    const result1 = await prisma.checklistTemplate.deleteMany({ where: { isActive: false } });
    console.log(`체크리스트 템플릿 ${result1.count}개 삭제`);
    
    const result2 = await prisma.precaution.deleteMany({ where: { isActive: false } });
    console.log(`주의사항 ${result2.count}개 삭제`);
    
    const result3 = await prisma.manual.deleteMany({ where: { isActive: false } });
    console.log(`메뉴얼 ${result3.count}개 삭제`);
    
    const result4 = await prisma.inventoryItem.deleteMany({ where: { isActive: false } });
    console.log(`재고 아이템 ${result4.count}개 삭제`);
    
    console.log('정리 완료!');
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simpleCleanup();
