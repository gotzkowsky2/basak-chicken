const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixOrphanConnections() {
  try {
    console.log('고아 연결들을 정리합니다...\n');

    // 1. 모든 연결된 항목들 조회
    const connections = await prisma.checklistItemConnection.findMany();

    console.log(`총 ${connections.length}개의 연결된 항목을 확인합니다.\n`);

    // 2. 고아 연결 찾기 및 삭제
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
      console.log(`❌ ${orphanConnections.length}개의 고아 연결을 발견했습니다:`);
      orphanConnections.forEach(conn => {
        console.log(`  - 연결 ID: ${conn.id}, 타입: ${conn.itemType}, 항목 ID: ${conn.itemId}`);
      });
      
      // 고아 연결들 삭제
      console.log('\n고아 연결들을 삭제합니다...');
      for (const orphan of orphanConnections) {
        await prisma.checklistItemConnection.delete({
          where: { id: orphan.id }
        });
        console.log(`✓ 연결 ID ${orphan.id} 삭제 완료`);
      }
      
      console.log(`\n✅ ${orphanConnections.length}개의 고아 연결이 정리되었습니다.`);
    } else {
      console.log('✅ 고아 연결이 없습니다.');
    }

    // 3. 정리 후 상태 확인
    console.log('\n=== 정리 후 상태 확인 ===');
    const remainingConnections = await prisma.checklistItemConnection.findMany();
    console.log(`남은 연결된 항목 수: ${remainingConnections.length}개`);
    
    // 유효한 연결 확인
    let validConnections = 0;
    for (const connection of remainingConnections) {
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
        
        if (exists) {
          validConnections++;
        }
      } catch (error) {
        // 무시
      }
    }
    
    console.log(`유효한 연결 수: ${validConnections}개`);
    console.log(`고아 연결 수: ${remainingConnections.length - validConnections}개`);

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixOrphanConnections();
