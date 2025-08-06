const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTagConnections() {
  console.log('=== 태그 연결 상태 확인 ===');
  
  try {
    // 1. 모든 태그 확인
    const tags = await prisma.tag.findMany();
    console.log('총 태그 수:', tags.length);
    tags.forEach(tag => console.log(`- ${tag.name} (${tag.id})`));
    
    // 2. 재고 아이템과 태그 연결 확인
    const inventoryWithTags = await prisma.inventoryItem.findMany({
      include: {
        tagRelations: {
          include: {
            tag: true
          }
        }
      }
    });
    console.log('\n=== 재고 아이템 태그 연결 ===');
    inventoryWithTags.forEach(item => {
      console.log(`${item.name}: ${item.tagRelations.map(r => r.tag.name).join(', ') || '태그 없음'}`);
    });
    
    // 3. 주의사항과 태그 연결 확인
    const precautionsWithTags = await prisma.precaution.findMany({
      include: {
        tagRelations: {
          include: {
            tag: true
          }
        }
      }
    });
    console.log('\n=== 주의사항 태그 연결 ===');
    precautionsWithTags.forEach(item => {
      console.log(`${item.title}: ${item.tagRelations.map(r => r.tag.name).join(', ') || '태그 없음'}`);
    });
    
    // 4. 메뉴얼과 태그 연결 확인
    const manualsWithTags = await prisma.manual.findMany({
      include: {
        tagRelations: {
          include: {
            tag: true
          }
        }
      }
    });
    console.log('\n=== 메뉴얼 태그 연결 ===');
    manualsWithTags.forEach(item => {
      console.log(`${item.title}: ${item.tagRelations.map(r => r.tag.name).join(', ') || '태그 없음'}`);
    });
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTagConnections(); 