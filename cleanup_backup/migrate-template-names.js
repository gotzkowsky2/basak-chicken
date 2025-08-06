const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 템플릿 이름 생성 함수
function generateTemplateName(workplace, category, timeSlot) {
  const workplaceLabels = {
    'HALL': '홀',
    'KITCHEN': '주방', 
    'COMMON': '공통'
  };
  
  const categoryLabels = {
    'CHECKLIST': '체크리스트',
    'PRECAUTIONS': '주의사항',
    'HYGIENE': '위생',
    'SUPPLIES': '용품',
    'INGREDIENTS': '재료',
    'COMMON': '공통',
    'MANUAL': '메뉴얼'
  };
  
  const timeSlotLabels = {
    'PREPARATION': '준비',
    'IN_PROGRESS': '진행',
    'CLOSING': '마감',
    'COMMON': '공통'
  };
  
  const workplaceLabel = workplaceLabels[workplace] || workplace;
  const categoryLabel = categoryLabels[category] || category;
  const timeSlotLabel = timeSlotLabels[timeSlot] || timeSlot;
  
  return `${workplaceLabel} - ${categoryLabel} - ${timeSlotLabel}`;
}

async function migrateTemplateNames() {
  try {
    console.log('체크리스트 템플릿 이름 마이그레이션을 시작합니다...');
    
    // 모든 템플릿 조회
    const templates = await prisma.checklistTemplate.findMany();
    console.log(`총 ${templates.length}개의 템플릿을 찾았습니다.`);
    
    // 각 템플릿에 대해 이름 생성 및 업데이트
    for (const template of templates) {
      const templateName = generateTemplateName(template.workplace, template.category, template.timeSlot);
      
      console.log(`템플릿 ID: ${template.id}`);
      console.log(`  기존 content: ${template.content}`);
      console.log(`  생성된 name: ${templateName}`);
      
      await prisma.checklistTemplate.update({
        where: { id: template.id },
        data: { name: templateName }
      });
    }
    
    console.log('모든 템플릿 이름이 성공적으로 업데이트되었습니다!');
    
  } catch (error) {
    console.error('마이그레이션 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateTemplateNames();