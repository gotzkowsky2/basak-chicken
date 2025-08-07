const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkInventoryData() {
  try {
    console.log('InventoryCheck 테이블 현황을 확인합니다...\n');

    // 1. 전체 데이터 수 확인
    const totalChecks = await prisma.inventoryCheck.count();
    console.log(`총 InventoryCheck 데이터 수: ${totalChecks}개\n`);

    // 2. 최근 10개 데이터 확인
    const recentChecks = await prisma.inventoryCheck.findMany({
      take: 10,
      orderBy: { checkedAt: 'desc' },
      include: {
        item: {
          select: {
            name: true,
            isActive: true
          }
        },
        employee: {
          select: {
            name: true
          }
        }
      }
    });

    console.log('=== 최근 10개 데이터 ===');
    recentChecks.forEach((check, index) => {
      console.log(`${index + 1}. ID: ${check.id}`);
      console.log(`   아이템: ${check.item.name} (활성: ${check.item.isActive})`);
      console.log(`   현재재고: ${check.currentStock}`);
      console.log(`   구매필요: ${check.needsRestock}`);
      console.log(`   체크한 사람: ${check.employee.name}`);
      console.log(`   체크 시간: ${check.checkedAt.toLocaleString()}`);
      console.log(`   메모: ${check.notes || '없음'}`);
      console.log('---');
    });

    // 3. false 값들 분석
    const needsRestockFalse = await prisma.inventoryCheck.count({
      where: { needsRestock: false }
    });
    
    const needsRestockTrue = await prisma.inventoryCheck.count({
      where: { needsRestock: true }
    });

    console.log('\n=== needsRestock 분석 ===');
    console.log(`needsRestock = false: ${needsRestockFalse}개`);
    console.log(`needsRestock = true: ${needsRestockTrue}개`);
    console.log(`false 비율: ${((needsRestockFalse / totalChecks) * 100).toFixed(1)}%`);

    // 4. 중복 데이터 확인 (같은 아이템, 같은 사람, 같은 시간대)
    const duplicateChecks = await prisma.$queryRaw`
      SELECT 
        "itemId", 
        "checkedBy", 
        DATE("checkedAt") as check_date,
        COUNT(*) as count
      FROM "InventoryCheck"
      GROUP BY "itemId", "checkedBy", DATE("checkedAt")
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `;

    console.log('\n=== 중복 데이터 확인 ===');
    if (duplicateChecks.length > 0) {
      console.log(`중복 데이터가 있는 조합: ${duplicateChecks.length}개`);
      duplicateChecks.forEach((dup, index) => {
        console.log(`${index + 1}. 아이템ID: ${dup.itemId}, 체크한사람: ${dup.checkedBy}, 날짜: ${dup.check_date}, 횟수: ${dup.count}회`);
      });
    } else {
      console.log('중복 데이터가 없습니다.');
    }

    // 5. 비활성화된 아이템의 체크 데이터
    const inactiveItemChecks = await prisma.inventoryCheck.findMany({
      where: {
        item: {
          isActive: false
        }
      },
      include: {
        item: {
          select: {
            name: true
          }
        }
      }
    });

    console.log('\n=== 비활성화된 아이템의 체크 데이터 ===');
    console.log(`비활성화된 아이템 체크 데이터: ${inactiveItemChecks.length}개`);
    
    if (inactiveItemChecks.length > 0) {
      const inactiveItemNames = [...new Set(inactiveItemChecks.map(check => check.item.name))];
      console.log('비활성화된 아이템들:', inactiveItemNames.join(', '));
    }

    // 6. 오래된 데이터 확인 (30일 이상)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const oldChecks = await prisma.inventoryCheck.count({
      where: {
        checkedAt: {
          lt: thirtyDaysAgo
        }
      }
    });

    console.log('\n=== 오래된 데이터 확인 ===');
    console.log(`30일 이상 된 데이터: ${oldChecks}개`);
    console.log(`최근 30일 데이터: ${totalChecks - oldChecks}개`);

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkInventoryData();
