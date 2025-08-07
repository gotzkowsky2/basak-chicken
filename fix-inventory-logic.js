const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixInventoryLogic() {
  try {
    console.log('InventoryCheck 로직 문제를 해결합니다...\n');

    // 1. 현재 상태 확인
    const totalChecks = await prisma.inventoryCheck.count();
    console.log(`현재 총 InventoryCheck 데이터: ${totalChecks}개`);

    // 2. 중복 데이터 정리 (같은 아이템, 같은 사람, 같은 날짜)
    console.log('\n=== 중복 데이터 정리 ===');
    
    const duplicateGroups = await prisma.$queryRaw`
      SELECT 
        "itemId", 
        "checkedBy", 
        DATE("checkedAt") as check_date,
        COUNT(*) as count,
        ARRAY_AGG(id ORDER BY "checkedAt" DESC) as ids
      FROM "InventoryCheck"
      GROUP BY "itemId", "checkedBy", DATE("checkedAt")
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `;

    let deletedDuplicates = 0;
    for (const group of duplicateGroups) {
      const ids = group.ids;
      // 첫 번째(가장 최근)를 제외하고 나머지 삭제
      const idsToDelete = ids.slice(1);
      
      for (const id of idsToDelete) {
        await prisma.inventoryCheck.delete({
          where: { id }
        });
        deletedDuplicates++;
      }
    }
    console.log(`중복 데이터 ${deletedDuplicates}개 삭제 완료`);

    // 3. 불필요한 체크 기록 정리 (재고가 충분한데 needsRestock=false인 경우)
    console.log('\n=== 불필요한 체크 기록 정리 ===');
    
    const unnecessaryChecks = await prisma.inventoryCheck.findMany({
      where: {
        needsRestock: false,
        notes: null
      },
      include: {
        item: {
          select: {
            name: true,
            minStock: true
          }
        }
      }
    });

    let deletedUnnecessary = 0;
    for (const check of unnecessaryChecks) {
      // 재고가 최소재고보다 20% 이상 많은 경우에만 삭제
      if (check.currentStock > check.item.minStock * 1.2) {
        await prisma.inventoryCheck.delete({
          where: { id: check.id }
        });
        deletedUnnecessary++;
      }
    }
    console.log(`불필요한 체크 기록 ${deletedUnnecessary}개 삭제 완료`);

    // 4. 오래된 데이터 정리 (7일 이상)
    console.log('\n=== 오래된 데이터 정리 ===');
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const oldChecks = await prisma.inventoryCheck.findMany({
      where: {
        checkedAt: {
          lt: sevenDaysAgo
        }
      }
    });

    if (oldChecks.length > 0) {
      await prisma.inventoryCheck.deleteMany({
        where: {
          checkedAt: {
            lt: sevenDaysAgo
          }
        }
      });
      console.log(`7일 이상 된 데이터 ${oldChecks.length}개 삭제 완료`);
    } else {
      console.log('7일 이상 된 데이터가 없습니다.');
    }

    // 5. 최종 상태 확인
    const finalCount = await prisma.inventoryCheck.count();
    console.log(`\n=== 최종 상태 ===`);
    console.log(`최종 데이터 수: ${finalCount}개`);
    console.log(`총 정리된 데이터: ${totalChecks - finalCount}개`);

    // 6. needsRestock 비율 재확인
    const needsRestockFalse = await prisma.inventoryCheck.count({
      where: { needsRestock: false }
    });
    
    const needsRestockTrue = await prisma.inventoryCheck.count({
      where: { needsRestock: true }
    });

    console.log(`\n=== needsRestock 최종 분석 ===`);
    console.log(`needsRestock = false: ${needsRestockFalse}개`);
    console.log(`needsRestock = true: ${needsRestockTrue}개`);
    if (finalCount > 0) {
      console.log(`false 비율: ${((needsRestockFalse / finalCount) * 100).toFixed(1)}%`);
    }

    console.log('\n✅ InventoryCheck 로직 문제 해결 완료!');

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixInventoryLogic();
