const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanDuplicates() {
  try {
    console.log('중복된 재고 아이템을 정리하는 중...\n');
    
    // 모든 재고 아이템 조회
    const allItems = await prisma.inventoryItem.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        currentStock: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    // 이름별로 그룹화
    const groupedByName = {};
    allItems.forEach(item => {
      if (!groupedByName[item.name]) {
        groupedByName[item.name] = [];
      }
      groupedByName[item.name].push(item);
    });
    
    // 중복된 항목들 찾기
    const duplicates = Object.entries(groupedByName).filter(([name, items]) => items.length > 1);
    
    if (duplicates.length === 0) {
      console.log('✅ 중복된 항목이 없습니다.');
      return;
    }
    
    console.log(`🚨 ${duplicates.length}개의 중복된 항목을 발견했습니다.\n`);
    
    let cleanedCount = 0;
    
    for (const [name, items] of duplicates) {
      console.log(`📦 ${name} 정리 중...`);
      
      // 활성화된 항목들만 필터링
      const activeItems = items.filter(item => item.isActive);
      
      if (activeItems.length === 0) {
        console.log(`  - 활성화된 항목이 없습니다.`);
        continue;
      }
      
      if (activeItems.length === 1) {
        console.log(`  - 활성화된 항목이 1개뿐입니다.`);
        continue;
      }
      
      // 최신 항목을 제외하고 나머지를 비활성화
      const sortedItems = activeItems.sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      
      const keepItem = sortedItems[0]; // 최신 항목
      const removeItems = sortedItems.slice(1); // 나머지 항목들
      
      console.log(`  - 유지할 항목: ID ${keepItem.id} (최신 업데이트: ${keepItem.updatedAt})`);
      
      for (const removeItem of removeItems) {
        console.log(`  - 비활성화할 항목: ID ${removeItem.id} (업데이트: ${removeItem.updatedAt})`);
        
        await prisma.inventoryItem.update({
          where: { id: removeItem.id },
          data: { isActive: false }
        });
        
        cleanedCount++;
      }
    }
    
    console.log(`\n✅ 정리 완료: ${cleanedCount}개의 중복 항목을 비활성화했습니다.`);
    
    // 정리 후 상태 확인
    console.log('\n📊 정리 후 상태:');
    const finalItems = await prisma.inventoryItem.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        category: true,
        currentStock: true
      },
      orderBy: { name: 'asc' }
    });
    
    console.log(`활성화된 재고 아이템: ${finalItems.length}개`);
    finalItems.forEach(item => {
      console.log(`  - ${item.name} (${item.category}): ${item.currentStock}개`);
    });
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDuplicates(); 