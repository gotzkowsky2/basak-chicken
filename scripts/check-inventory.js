const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkInventory() {
  try {
    console.log('현재 재고 아이템 상태 확인 중...\n');
    
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
    
    console.log(`총 ${allItems.length}개의 재고 아이템이 있습니다.\n`);
    
    // 이름별로 그룹화하여 중복 확인
    const groupedByName = {};
    allItems.forEach(item => {
      if (!groupedByName[item.name]) {
        groupedByName[item.name] = [];
      }
      groupedByName[item.name].push(item);
    });
    
    // 중복된 항목들 출력
    const duplicates = Object.entries(groupedByName).filter(([name, items]) => items.length > 1);
    
    if (duplicates.length > 0) {
      console.log('🚨 중복된 항목들:');
      duplicates.forEach(([name, items]) => {
        console.log(`\n📦 ${name}:`);
        items.forEach(item => {
          console.log(`  - ID: ${item.id}, 카테고리: ${item.category}, 재고: ${item.currentStock}, 활성화: ${item.isActive}, 생성일: ${item.createdAt}`);
        });
      });
    } else {
      console.log('✅ 중복된 항목이 없습니다.');
    }
    
    // 비활성화된 항목들
    const inactiveItems = allItems.filter(item => !item.isActive);
    if (inactiveItems.length > 0) {
      console.log('\n⚠️ 비활성화된 항목들:');
      inactiveItems.forEach(item => {
        console.log(`  - ${item.name} (ID: ${item.id})`);
      });
    }
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkInventory(); 