const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createInventoryAndTags() {
  try {
    console.log('=== 기본 재고 아이템과 태그 생성 ===');
    
    // 1. 태그 생성
    const tags = [
      { name: '떡볶이', color: '#FF6B6B' },
      { name: '닭고기', color: '#4ECDC4' },
      { name: '소스', color: '#45B7D1' },
      { name: '청소용품', color: '#96CEB4' },
      { name: '조리법', color: '#FFEAA7' },
      { name: '설비', color: '#DDA0DD' }
    ];
    
    console.log('태그 생성 중...');
    for (const tagData of tags) {
      const tag = await prisma.tag.upsert({
        where: { name: tagData.name },
        update: {},
        create: {
          name: tagData.name,
          color: tagData.color
        }
      });
      console.log(`✓ 태그 생성: ${tag.name}`);
    }
    
    // 2. 재고 아이템 생성
    const inventoryItems = [
      {
        name: '전분가루',
        category: 'INGREDIENTS',
        currentStock: 10,
        minStock: 5,
        unit: 'kg',
        tags: ['떡볶이']
      },
      {
        name: '밀가루',
        category: 'INGREDIENTS',
        currentStock: 8,
        minStock: 3,
        unit: 'kg',
        tags: ['떡볶이']
      },
      {
        name: '고추가루',
        category: 'INGREDIENTS',
        currentStock: 5,
        minStock: 2,
        unit: 'kg',
        tags: ['떡볶이']
      },
      {
        name: '염지된 윙',
        category: 'INGREDIENTS',
        currentStock: 15,
        minStock: 10,
        unit: 'kg',
        tags: ['닭고기']
      },
      {
        name: '떡볶이 소스',
        category: 'INGREDIENTS',
        currentStock: 20,
        minStock: 10,
        unit: 'L',
        tags: ['소스']
      },
      {
        name: '세척기 세제',
        category: 'SUPPLIES',
        currentStock: 5,
        minStock: 2,
        unit: '개',
        tags: ['청소용품']
      },
      {
        name: '장갑',
        category: 'SUPPLIES',
        currentStock: 50,
        minStock: 20,
        unit: '개',
        tags: ['청소용품']
      }
    ];
    
    console.log('\n재고 아이템 생성 중...');
    for (const itemData of inventoryItems) {
      const item = await prisma.inventoryItem.create({
        data: {
          name: itemData.name,
          category: itemData.category,
          currentStock: itemData.currentStock,
          minStock: itemData.minStock,
          unit: itemData.unit
        }
      });
      
      // 태그 연결
      for (const tagName of itemData.tags) {
        const tag = await prisma.tag.findUnique({
          where: { name: tagName }
        });
        
        if (tag) {
          await prisma.inventoryItemTagRelation.create({
            data: {
              itemId: item.id,
              tagId: tag.id
            }
          });
        }
      }
      
      console.log(`✓ 재고 아이템 생성: ${item.name} (${itemData.tags.join(', ')})`);
    }
    
    // 3. 기존 체크리스트 아이템들을 재고 아이템과 연결
    console.log('\n체크리스트 아이템과 재고 아이템 연결 중...');
    
    const connections = [
      { checklistContent: '전분가루 확인', inventoryName: '전분가루' },
      { checklistContent: '밀가루 확인', inventoryName: '밀가루' },
      { checklistContent: '고추가루 확인', inventoryName: '고추가루' },
      { checklistContent: '염지된 윙', inventoryName: '염지된 윙' }
    ];
    
    for (const connection of connections) {
      const checklistItem = await prisma.checklistItem.findFirst({
        where: { content: connection.checklistContent }
      });
      
      const inventoryItem = await prisma.inventoryItem.findFirst({
        where: { name: connection.inventoryName }
      });
      
      if (checklistItem && inventoryItem) {
        await prisma.checklistItem.update({
          where: { id: checklistItem.id },
          data: { inventoryItemId: inventoryItem.id }
        });
        console.log(`✓ 연결: ${connection.checklistContent} ↔ ${connection.inventoryName}`);
      }
    }
    
    console.log('\n=== 생성 완료 ===');
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createInventoryAndTags(); 