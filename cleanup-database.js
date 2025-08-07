const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupInactiveData() {
  try {
    console.log('비활성화된 데이터 정리를 시작합니다...\n');

    // 1. 비활성화된 체크리스트 템플릿 삭제
    const deletedTemplates = await prisma.checklistTemplate.deleteMany({
      where: { isActive: false }
    });
    console.log(`✓ 체크리스트 템플릿 ${deletedTemplates.count}개 삭제`);

    // 2. 비활성화된 체크리스트 항목 삭제
    const deletedItems = await prisma.checklistItem.deleteMany({
      where: { isActive: false }
    });
    console.log(`✓ 체크리스트 항목 ${deletedItems.count}개 삭제`);

    // 3. 비활성화된 주의사항 삭제
    const deletedPrecautions = await prisma.precaution.deleteMany({
      where: { isActive: false }
    });
    console.log(`✓ 주의사항 ${deletedPrecautions.count}개 삭제`);

    // 4. 비활성화된 메뉴얼 삭제
    const deletedManuals = await prisma.manual.deleteMany({
      where: { isActive: false }
    });
    console.log(`✓ 메뉴얼 ${deletedManuals.count}개 삭제`);

    // 5. 비활성화된 재고 아이템 삭제
    const deletedInventoryItems = await prisma.inventoryItem.deleteMany({
      where: { isActive: false }
    });
    console.log(`✓ 재고 아이템 ${deletedInventoryItems.count}개 삭제`);

    // 6. 비활성화된 직원 삭제
    const deletedEmployees = await prisma.employee.deleteMany({
      where: { isActive: false }
    });
    console.log(`✓ 직원 ${deletedEmployees.count}명 삭제`);

    // 7. 고아 데이터 정리 - 연결된 항목 관계
    const activeItems = await prisma.checklistItem.findMany({
      where: { isActive: true },
      select: { id: true }
    });
    const activePrecautions = await prisma.precaution.findMany({
      where: { isActive: true },
      select: { id: true }
    });
    const activeManuals = await prisma.manual.findMany({
      where: { isActive: true },
      select: { id: true }
    });
    const activeInventoryItems = await prisma.inventoryItem.findMany({
      where: { isActive: true },
      select: { id: true }
    });

    const activeItemIds = activeItems.map(item => item.id);
    const activeConnectedItemIds = [
      ...activePrecautions.map(p => p.id),
      ...activeManuals.map(m => m.id),
      ...activeInventoryItems.map(i => i.id)
    ];

    // ChecklistItemConnection에서 고아 데이터 정리
    const deletedConnections = await prisma.checklistItemConnection.deleteMany({
      where: {
        OR: [
          { checklistItemId: { notIn: activeItemIds } },
          { itemId: { notIn: activeConnectedItemIds } }
        ]
      }
    });
    console.log(`✓ 연결된 항목 관계 ${deletedConnections.count}개 정리`);

    // 8. 태그 관계 고아 데이터 정리
    const activeTemplates = await prisma.checklistTemplate.findMany({
      where: { isActive: true },
      select: { id: true }
    });

    const deletedTemplateTagRelations = await prisma.checklistTemplateTagRelation.deleteMany({
      where: {
        templateId: { notIn: activeTemplates.map(t => t.id) }
      }
    });
    console.log(`✓ 체크리스트 템플릿 태그 관계 ${deletedTemplateTagRelations.count}개 정리`);

    const deletedPrecautionTagRelations = await prisma.precautionTagRelation.deleteMany({
      where: {
        precautionId: { notIn: activePrecautions.map(p => p.id) }
      }
    });
    console.log(`✓ 주의사항 태그 관계 ${deletedPrecautionTagRelations.count}개 정리`);

    const deletedManualTagRelations = await prisma.manualTagRelation.deleteMany({
      where: {
        manualId: { notIn: activeManuals.map(m => m.id) }
      }
    });
    console.log(`✓ 메뉴얼 태그 관계 ${deletedManualTagRelations.count}개 정리`);

    const deletedInventoryTagRelations = await prisma.inventoryItemTagRelation.deleteMany({
      where: {
        itemId: { notIn: activeInventoryItems.map(i => i.id) }
      }
    });
    console.log(`✓ 재고 아이템 태그 관계 ${deletedInventoryTagRelations.count}개 정리`);

    // 9. 매뉴얼-주의사항 관계 고아 데이터 정리
    const deletedManualPrecautionRelations = await prisma.manualPrecautionRelation.deleteMany({
      where: {
        OR: [
          { manualId: { notIn: activeManuals.map(m => m.id) } },
          { precautionId: { notIn: activePrecautions.map(p => p.id) } }
        ]
      }
    });
    console.log(`✓ 매뉴얼-주의사항 관계 ${deletedManualPrecautionRelations.count}개 정리`);

    // 10. 사용되지 않는 태그 정리
    const usedTagIds = await prisma.$queryRaw`
      SELECT DISTINCT "tagId" FROM "ChecklistTemplateTagRelation"
      UNION
      SELECT DISTINCT "tagId" FROM "PrecautionTagRelation"
      UNION
      SELECT DISTINCT "tagId" FROM "ManualTagRelation"
      UNION
      SELECT DISTINCT "tagId" FROM "InventoryItemTagRelation"
    `;

    const usedTagIdList = usedTagIds.map(t => t.tagId);
    const deletedTags = await prisma.tag.deleteMany({
      where: {
        id: { notIn: usedTagIdList }
      }
    });
    console.log(`✓ 사용되지 않는 태그 ${deletedTags.count}개 정리`);

    console.log('\n✅ 비활성화된 데이터 정리가 완료되었습니다!');

  } catch (error) {
    console.error('❌ 데이터 정리 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupInactiveData();
