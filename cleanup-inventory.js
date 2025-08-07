const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupInventoryData() {
  try {
    console.log('InventoryCheck 데이터 정리를 시작합니다...\n');

    // 1. 현재 상태 확인
    const totalChecks = await prisma.inventoryCheck.count();
    console.log(`현재 총 데이터 수: ${totalChecks}개`);

    // 2. 중복 데이터 찾기 (같은 아이템, 같은 사람, 같은 날짜)
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

    console.log(`\n중복 데이터 그룹: ${duplicateGroups.length}개`);

    // 3. 중복 데이터 정리 (각 그룹에서 가장 최근 것만 남기고 나머지 삭제)
    let deletedCount = 0;
    for (const group of duplicateGroups) {
      const ids = group.ids;
      // 첫 번째(가장 최근)를 제외하고 나머지 삭제
      const idsToDelete = ids.slice(1);
      
      for (const id of idsToDelete) {
        await prisma.inventoryCheck.delete({
          where: { id }
        });
        deletedCount++;
      }
    }

    console.log(`중복 데이터 ${deletedCount}개 삭제 완료`);

    // 4. needsRestock = false인 불필요한 데이터 정리
    // (재고가 충분한데 구매 불필요로 표시된 데이터들)
    const unnecessaryChecks = await prisma.inventoryCheck.findMany({
      where: {
        needsRestock: false,
        notes: null // 메모가 없는 경우
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

    console.log(`\nneedsRestock = false인 불필요한 데이터: ${unnecessaryChecks.length}개`);

    // 재고가 최소재고보다 많은 경우에만 삭제
    let unnecessaryDeleted = 0;
    for (const check of unnecessaryChecks) {
      if (check.currentStock > check.item.minStock) {
        await prisma.inventoryCheck.delete({
          where: { id: check.id }
        });
        unnecessaryDeleted++;
      }
    }

    console.log(`불필요한 데이터 ${unnecessaryDeleted}개 삭제 완료`);

    // 5. 정리 후 상태 확인
    const remainingChecks = await prisma.inventoryCheck.count();
    console.log(`\n=== 정리 후 상태 ===`);
    console.log(`남은 데이터 수: ${remainingChecks}개`);
    console.log(`총 삭제된 데이터: ${totalChecks - remainingChecks}개`);

    // 6. 최근 데이터만 남기기 (최근 7일)
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
      console.log(`\n7일 이상 된 데이터: ${oldChecks.length}개`);
      
      // 사용자 확인 (실제로는 자동 삭제)
      console.log('7일 이상 된 데이터를 삭제합니다...');
      await prisma.inventoryCheck.deleteMany({
        where: {
          checkedAt: {
            lt: sevenDaysAgo
          }
        }
      });
      console.log(`${oldChecks.length}개의 오래된 데이터 삭제 완료`);
    }

    // 7. 최종 상태 확인
    const finalCount = await prisma.inventoryCheck.count();
    console.log(`\n=== 최종 상태 ===`);
    console.log(`최종 데이터 수: ${finalCount}개`);
    console.log(`총 정리된 데이터: ${totalChecks - finalCount}개`);

    // 8. needsRestock 비율 재확인
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

    console.log('\n✅ InventoryCheck 데이터 정리가 완료되었습니다!');

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupInventoryData();
