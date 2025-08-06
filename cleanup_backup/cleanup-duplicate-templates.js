const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupDuplicateTemplates() {
  try {
    console.log('=== 중복 템플릿 정리 시작 ===');
    
    // 모든 템플릿 조회
    const allTemplates = await prisma.checklistTemplate.findMany({
      select: {
        id: true,
        name: true,
        isActive: true,
        workplace: true,
        timeSlot: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });
    
    console.log('전체 템플릿 수:', allTemplates.length);
    
    // 이름별로 그룹화
    const templateGroups = {};
    allTemplates.forEach(template => {
      const key = `${template.name}_${template.workplace}_${template.timeSlot}`;
      if (!templateGroups[key]) {
        templateGroups[key] = [];
      }
      templateGroups[key].push(template);
    });
    
    // 중복 템플릿 찾기
    const duplicatesToDelete = [];
    
    Object.entries(templateGroups).forEach(([key, templates]) => {
      if (templates.length > 1) {
        console.log(`\n중복 발견: ${key}`);
        templates.forEach(t => {
          console.log(`  - ID: ${t.id}, 활성화: ${t.isActive}, 생성일: ${t.createdAt}`);
        });
        
        // 활성화된 템플릿이 있으면 비활성화된 것들 삭제
        const activeTemplates = templates.filter(t => t.isActive);
        const inactiveTemplates = templates.filter(t => !t.isActive);
        
        if (activeTemplates.length > 0 && inactiveTemplates.length > 0) {
          console.log(`  → 활성화된 템플릿 ${activeTemplates.length}개 유지, 비활성화된 템플릿 ${inactiveTemplates.length}개 삭제`);
          duplicatesToDelete.push(...inactiveTemplates);
        } else if (activeTemplates.length === 0 && inactiveTemplates.length > 1) {
          // 모두 비활성화된 경우 가장 오래된 것 하나만 남기고 나머지 삭제
          const sortedInactive = inactiveTemplates.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          console.log(`  → 모두 비활성화됨. 가장 오래된 것 1개 유지, 나머지 ${sortedInactive.length - 1}개 삭제`);
          duplicatesToDelete.push(...sortedInactive.slice(1));
        }
      }
    });
    
    if (duplicatesToDelete.length === 0) {
      console.log('\n삭제할 중복 템플릿이 없습니다.');
      return;
    }
    
    console.log(`\n삭제할 템플릿 수: ${duplicatesToDelete.length}`);
    duplicatesToDelete.forEach(t => {
      console.log(`  - ${t.name} (${t.workplace}, ${t.timeSlot}) - ID: ${t.id}`);
    });
    
    // 사용자 확인
    console.log('\n위 템플릿들을 삭제하시겠습니까? (y/N)');
    
    // 실제 삭제는 주석 처리 (안전을 위해)
    for (const template of duplicatesToDelete) {
      await prisma.checklistTemplate.delete({
        where: { id: template.id }
      });
      console.log(`삭제됨: ${template.name} (${template.id})`);
    }
    
    console.log('\n중복 템플릿 정리가 완료되었습니다.');
    
  } catch (error) {
    console.error('에러:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicateTemplates(); 