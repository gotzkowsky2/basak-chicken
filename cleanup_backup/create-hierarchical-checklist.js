const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createHierarchicalChecklist() {
  try {
    console.log('=== 하위 카테고리 구조로 체크리스트 생성 ===');
    
    // 1. 홀, 준비 템플릿 생성
    const hallPreparationTemplate = await prisma.checklistTemplate.create({
      data: {
        content: '홀, 준비',
        workplace: 'HALL',
        category: 'CHECKLIST',
        timeSlot: 'PREPARATION',
        name: '홀, 준비',
        isActive: true,
        inputter: 'system'
      }
    });
    
    console.log('홀, 준비 템플릿 생성 완료:', hallPreparationTemplate.id);
    
    // 2. 홀, 준비의 하위 카테고리들 생성
    const hallCategories = [
      {
        content: '재료 체크',
        type: 'category',
        order: 1,
        children: [
          { content: '전분가루 확인', type: 'inventory', order: 1 },
          { content: '밀가루 확인', type: 'inventory', order: 2 },
          { content: '고추가루 확인', type: 'inventory', order: 3 },
          { content: '염지된 윙', type: 'inventory', order: 4 }
        ]
      },
      {
        content: '설비 준비',
        type: 'category',
        order: 2,
        children: [
          { content: '세척기 준비', type: 'check', order: 1 },
          { content: '연수기 체크 및 소금. 물 채우기', type: 'check', order: 2 },
          { content: '냉장고 냉동고 온도 체크 및 기입', type: 'check', order: 3 }
        ]
      },
      {
        content: '환경 준비',
        type: 'category',
        order: 3,
        children: [
          { content: '걸래 삶기', type: 'check', order: 1 },
          { content: '소스 제자리 (영업위치로)', type: 'check', order: 2 },
          { content: '휴지 , 장갑 체크', type: 'check', order: 3 },
          { content: '집기류 배치', type: 'check', order: 4 }
        ]
      },
      {
        content: '음식 준비',
        type: 'category',
        order: 4,
        children: [
          { content: '밥짓기', type: 'check', order: 1 },
          { content: '보관해놓은 닭 꺼내두기 (냉동고)', type: 'check', order: 2 }
        ]
      }
    ];
    
    // 3. 각 카테고리와 하위 항목들을 생성
    for (const category of hallCategories) {
      console.log(`\n=== ${category.content} 카테고리 생성 중 ===`);
      
      // 카테고리 생성
      const parentItem = await prisma.checklistItem.create({
        data: {
          templateId: hallPreparationTemplate.id,
          type: category.type,
          content: category.content,
          order: category.order,
          isRequired: true,
          isActive: true
        }
      });
      
      console.log(`✓ ${category.content} 카테고리 생성 완료 (ID: ${parentItem.id})`);
      
      // 하위 항목들 생성
      for (const child of category.children) {
        const childItem = await prisma.checklistItem.create({
          data: {
            templateId: hallPreparationTemplate.id,
            parentId: parentItem.id,
            type: child.type,
            content: child.content,
            order: child.order,
            isRequired: true,
            isActive: true
          }
        });
        
        console.log(`  ✓ ${child.content} 생성 완료`);
      }
    }
    
    // 4. 주방, 준비 템플릿 생성
    const kitchenPreparationTemplate = await prisma.checklistTemplate.create({
      data: {
        content: '주방, 준비',
        workplace: 'KITCHEN',
        category: 'CHECKLIST',
        timeSlot: 'PREPARATION',
        name: '주방, 준비',
        isActive: true,
        inputter: 'system'
      }
    });
    
    console.log('\n주방, 준비 템플릿 생성 완료:', kitchenPreparationTemplate.id);
    
    // 5. 주방, 준비의 하위 카테고리들 생성
    const kitchenCategories = [
      {
        content: '재료 준비',
        type: 'category',
        order: 1,
        children: [
          { content: '전분가루 확인', type: 'inventory', order: 1 },
          { content: '밀가루 확인', type: 'inventory', order: 2 },
          { content: '고추가루 확인', type: 'inventory', order: 3 },
          { content: '염지된 윙', type: 'inventory', order: 4 }
        ]
      },
      {
        content: '설비 점검',
        type: 'category',
        order: 2,
        children: [
          { content: '연수기 체크 및 소금. 물 채우기', type: 'check', order: 1 },
          { content: '가스레인지 점검', type: 'check', order: 2 },
          { content: '환기 시스템 확인', type: 'check', order: 3 }
        ]
      },
      {
        content: '환경 준비',
        type: 'category',
        order: 3,
        children: [
          { content: '주방 청소', type: 'check', order: 1 },
          { content: '조리도구 준비', type: 'check', order: 2 },
          { content: '집기류 배치', type: 'check', order: 3 }
        ]
      }
    ];
    
    // 6. 주방 카테고리들 생성
    for (const category of kitchenCategories) {
      console.log(`\n=== ${category.content} 카테고리 생성 중 ===`);
      
      const parentItem = await prisma.checklistItem.create({
        data: {
          templateId: kitchenPreparationTemplate.id,
          type: category.type,
          content: category.content,
          order: category.order,
          isRequired: true,
          isActive: true
        }
      });
      
      console.log(`✓ ${category.content} 카테고리 생성 완료 (ID: ${parentItem.id})`);
      
      for (const child of category.children) {
        const childItem = await prisma.checklistItem.create({
          data: {
            templateId: kitchenPreparationTemplate.id,
            parentId: parentItem.id,
            type: child.type,
            content: child.content,
            order: child.order,
            isRequired: true,
            isActive: true
          }
        });
        
        console.log(`  ✓ ${child.content} 생성 완료`);
      }
    }
    
    // 7. 최종 결과 확인
    console.log('\n=== 최종 생성 결과 ===');
    const templates = await prisma.checklistTemplate.findMany({
      include: {
        items: {
          include: {
            children: true
          },
          where: {
            parentId: null // 최상위 항목들만
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
    
    templates.forEach((template, index) => {
      console.log(`\n${index + 1}. ${template.content} (${template.workplace}, ${template.timeSlot})`);
      template.items.forEach((item, itemIndex) => {
        console.log(`   ${itemIndex + 1}. ${item.content} (${item.type}) - 하위 항목 ${item.children.length}개`);
        item.children.forEach((child, childIndex) => {
          console.log(`     ${childIndex + 1}. ${child.content} (${child.type})`);
        });
      });
    });
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createHierarchicalChecklist();