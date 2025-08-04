const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function activateAllInventory() {
  try {
    console.log('모든 재고 아이템을 활성화하는 중...');
    
    const result = await prisma.inventoryItem.updateMany({
      where: {
        isActive: false
      },
      data: {
        isActive: true
      }
    });
    
    console.log(`${result.count}개의 재고 아이템이 활성화되었습니다.`);
    
    // 모든 재고 아이템 목록 출력
    const allItems = await prisma.inventoryItem.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        isActive: true,
        currentStock: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log('\n현재 모든 재고 아이템:');
    allItems.forEach(item => {
      console.log(`- ${item.name} (${item.category}): ${item.currentStock}개, 활성화: ${item.isActive}`);
    });
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

activateAllInventory(); 