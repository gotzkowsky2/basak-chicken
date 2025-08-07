const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkConnections() {
  try {
    console.log('연결된 항목들의 관계를 확인합니다...\n');

    // 1. 모든 연결된 항목들 조회
    const connections = await prisma.checklistItemConnection.findMany({
      include: {
        checklistItem: {
          select: {
            id: true,
            content: true
          }
        }
      }
    });

    console.log(`총 ${connections.length}개의 연결된 항목이 있습니다.\n`);

    // 2. 각 연결된 항목의 상세 정보 확인
    for (const connection of connections) {
      console.log(`연결 ID: ${connection.id}`);
      console.log(`체크리스트 항목: ${connection.checklistItem.content}`);
      console.log(`연결된 항목 타입: ${connection.itemType}`);
      console.log(`연결된 항목 ID: ${connection.itemId}`);
      console.log(`순서: ${connection.order}`);
      
      // 연결된 항목의 실제 데이터 확인
      let connectedItem = null;
      try {
        switch (connection.itemType) {
          case 'precaution':
            connectedItem = await prisma.precaution.findUnique({
              where: { id: connection.itemId }
            });
            break;
          case 'manual':
            connectedItem = await prisma.manual.findUnique({
              where: { id: connection.itemId }
            });
            break;
          case 'inventory':
            connectedItem = await prisma.inventoryItem.findUnique({
              where: { id: connection.itemId }
            });
            break;
        }
        
        if (connectedItem) {
          console.log(`연결된 항목 제목: ${connectedItem.title || connectedItem.name}`);
          console.log(`활성 상태: ${connectedItem.isActive}`);
        } else {
          console.log(`❌ 연결된 항목을 찾을 수 없음 (ID: ${connection.itemId})`);
        }
      } catch (error) {
        console.log(`❌ 연결된 항목 조회 오류: ${error.message}`);
      }
      
      console.log('---');
    }

    // 3. 고아 데이터 확인
    console.log('\n=== 고아 데이터 확인 ===');
    
    const orphanConnections = [];
    for (const connection of connections) {
      let exists = false;
      try {
        switch (connection.itemType) {
          case 'precaution':
            exists = await prisma.precaution.findUnique({ where: { id: connection.itemId } }) !== null;
            break;
          case 'manual':
            exists = await prisma.manual.findUnique({ where: { id: connection.itemId } }) !== null;
            break;
          case 'inventory':
            exists = await prisma.inventoryItem.findUnique({ where: { id: connection.itemId } }) !== null;
            break;
        }
        
        if (!exists) {
          orphanConnections.push(connection);
        }
      } catch (error) {
        orphanConnections.push(connection);
      }
    }
    
    if (orphanConnections.length > 0) {
      console.log(`❌ ${orphanConnections.length}개의 고아 연결이 발견되었습니다:`);
      orphanConnections.forEach(conn => {
        console.log(`  - 연결 ID: ${conn.id}, 타입: ${conn.itemType}, 항목 ID: ${conn.itemId}`);
      });
    } else {
      console.log('✅ 모든 연결이 유효합니다.');
    }

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkConnections();
