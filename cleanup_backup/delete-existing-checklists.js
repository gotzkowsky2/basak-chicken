const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteExistingChecklists() {
  try {
    // 오늘 날짜
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    console.log('=== 기존 체크리스트 삭제 ===');
    console.log('대상 날짜:', targetDate);
    
    // 오늘 생성된 체크리스트 인스턴스들 조회
    const existingInstances = await prisma.checklistInstance.findMany({
      where: {
        date: {
          gte: targetDate,
          lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });
    
    console.log('삭제할 인스턴스 수:', existingInstances.length);
    
    if (existingInstances.length > 0) {
      existingInstances.forEach((instance, index) => {
        console.log(`${index + 1}. ID: ${instance.id}, 템플릿: ${instance.templateId}, 날짜: ${instance.date}`);
      });
      
      // 삭제 실행
      const deleteResult = await prisma.checklistInstance.deleteMany({
        where: {
          date: {
            gte: targetDate,
            lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      });
      
      console.log('삭제 완료:', deleteResult.count, '개');
    } else {
      console.log('삭제할 인스턴스가 없습니다.');
    }
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteExistingChecklists();