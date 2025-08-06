const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTemplateItems() {
  try {
    const templateId = 'cmdn9pskh0002u25042ljtf8i'; // 홀, 준비 템플릿
    
    console.log('=== 템플릿 정보 확인 ===');
    console.log('템플릿 ID:', templateId);
    
    const template = await prisma.checklistTemplate.findUnique({
      where: { id: templateId },
      include: { items: true }
    });
    
    if (template) {
      console.log('템플릿 정보:', {
        id: template.id,
        content: template.content,
        workplace: template.workplace,
        category: template.category,
        timeSlot: template.timeSlot,
        itemsCount: template.items.length
      });
      
      console.log('=== Items 목록 ===');
      template.items.forEach((item, index) => {
        console.log(`${index + 1}. ${item.content} (ID: ${item.id})`);
      });
    } else {
      console.log('템플릿을 찾을 수 없습니다.');
    }
    
    console.log('\n=== 인스턴스 정보 ===');
    const instances = await prisma.checklistInstance.findMany({
      where: { templateId: templateId },
      include: { 
        template: { 
          include: { items: true } 
        } 
      }
    });
    
    console.log('인스턴스 수:', instances.length);
    instances.forEach((instance, index) => {
      console.log(`인스턴스 ${index + 1}:`, {
        id: instance.id,
        date: instance.date,
        templateItemsCount: instance.template.items.length
      });
    });
    
    // 모든 ChecklistItem 확인
    console.log('\n=== 전체 ChecklistItem 확인 ===');
    const allItems = await prisma.checklistItem.findMany({
      include: { template: true }
    });
    
    console.log('전체 ChecklistItem 수:', allItems.length);
    allItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.content} (템플릿: ${item.template?.content || '없음'})`);
    });
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTemplateItems();