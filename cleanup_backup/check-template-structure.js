const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTemplateStructure() {
  try {
    console.log('=== 템플릿 구조 확인 ===\n');

    // 1. 모든 템플릿 확인
    const templates = await prisma.checklistTemplate.findMany();
    console.log('📋 템플릿 목록:');
    templates.forEach(template => {
      console.log(`- ID: ${template.id}`);
      console.log(`  이름: ${template.name}`);
      console.log(`  내용: ${template.content}`);
      console.log(`  위치: ${template.workplace}`);
      console.log(`  시간대: ${template.timeSlot}`);
      console.log(`  활성: ${template.isActive}`);
      console.log('');
    });

    // 2. 템플릿별 아이템 확인
    for (const template of templates) {
      console.log(`🔍 템플릿 "${template.content}" (${template.id})의 아이템:`);
      
      const items = await prisma.checklistItem.findMany({
        where: { templateId: template.id },
        include: {
          children: true,
          connectedItems: true
        },
        orderBy: { order: 'asc' }
      });

      console.log(`  총 ${items.length}개 아이템`);
      items.forEach(item => {
        console.log(`  - ${item.content} (${item.type})`);
        console.log(`    연결된 항목: ${item.connectedItems.length}개`);
        if (item.children.length > 0) {
          console.log(`    하위 항목: ${item.children.length}개`);
        }
      });
      console.log('');
    }

    // 3. 체크리스트 인스턴스와 템플릿 관계 확인
    const instances = await prisma.checklistInstance.findMany({
      include: {
        template: true,
        employee: true
      }
    });

    console.log('📝 체크리스트 인스턴스:');
    instances.forEach(instance => {
      console.log(`- 인스턴스 ID: ${instance.id}`);
      console.log(`  직원: ${instance.employee?.name || 'Unknown'}`);
      console.log(`  템플릿 ID: ${instance.templateId}`);
      console.log(`  템플릿 내용: ${instance.template?.content || 'Unknown'}`);
      console.log(`  날짜: ${instance.date.toISOString()}`);
      console.log('');
    });

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTemplateStructure(); 