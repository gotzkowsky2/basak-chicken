-- 비활성화된 데이터 현황 확인 스크립트

-- 1. 비활성화된 체크리스트 템플릿 수
SELECT 'ChecklistTemplate' as table_name, COUNT(*) as inactive_count 
FROM "ChecklistTemplate" WHERE "isActive" = false;

-- 2. 비활성화된 체크리스트 항목 수
SELECT 'ChecklistItem' as table_name, COUNT(*) as inactive_count 
FROM "ChecklistItem" WHERE "isActive" = false;

-- 3. 비활성화된 주의사항 수
SELECT 'Precaution' as table_name, COUNT(*) as inactive_count 
FROM "Precaution" WHERE "isActive" = false;

-- 4. 비활성화된 메뉴얼 수
SELECT 'Manual' as table_name, COUNT(*) as inactive_count 
FROM "Manual" WHERE "isActive" = false;

-- 5. 비활성화된 재고 아이템 수
SELECT 'InventoryItem' as table_name, COUNT(*) as inactive_count 
FROM "InventoryItem" WHERE "isActive" = false;

-- 6. 비활성화된 직원 수
SELECT 'Employee' as table_name, COUNT(*) as inactive_count 
FROM "Employee" WHERE "isActive" = false;

-- 7. 고아 데이터 확인 - 연결된 항목 관계
SELECT 'ChecklistItemConnectedItem - 고아 데이터' as table_name, COUNT(*) as orphan_count
FROM "ChecklistItemConnectedItem" 
WHERE "itemId" NOT IN (SELECT id FROM "ChecklistItem" WHERE "isActive" = true)
   OR "connectedItemId" NOT IN (
     SELECT id FROM "Precaution" WHERE "isActive" = true
     UNION
     SELECT id FROM "Manual" WHERE "isActive" = true
     UNION
     SELECT id FROM "InventoryItem" WHERE "isActive" = true
   );

-- 8. 고아 데이터 확인 - 태그 관계
SELECT 'Tag Relations - 고아 데이터' as table_name, 
       (SELECT COUNT(*) FROM "ChecklistTemplateTagRelation" WHERE "templateId" NOT IN (SELECT id FROM "ChecklistTemplate" WHERE "isActive" = true)) +
       (SELECT COUNT(*) FROM "PrecautionTagRelation" WHERE "precautionId" NOT IN (SELECT id FROM "Precaution" WHERE "isActive" = true)) +
       (SELECT COUNT(*) FROM "ManualTagRelation" WHERE "manualId" NOT IN (SELECT id FROM "Manual" WHERE "isActive" = true)) +
       (SELECT COUNT(*) FROM "InventoryItemTagRelation" WHERE "inventoryItemId" NOT IN (SELECT id FROM "InventoryItem" WHERE "isActive" = true)) as orphan_count;

-- 9. 사용되지 않는 태그 수
SELECT 'Unused Tags' as table_name, COUNT(*) as unused_count
FROM "Tag" 
WHERE id NOT IN (
  SELECT DISTINCT "tagId" FROM "ChecklistTemplateTagRelation"
  UNION
  SELECT DISTINCT "tagId" FROM "PrecautionTagRelation"
  UNION
  SELECT DISTINCT "tagId" FROM "ManualTagRelation"
  UNION
  SELECT DISTINCT "tagId" FROM "InventoryItemTagRelation"
);

-- 10. 매뉴얼-주의사항 관계 고아 데이터
SELECT 'ManualPrecautionRelation - 고아 데이터' as table_name, COUNT(*) as orphan_count
FROM "ManualPrecautionRelation" 
WHERE "manualId" NOT IN (SELECT id FROM "Manual" WHERE "isActive" = true)
   OR "precautionId" NOT IN (SELECT id FROM "Precaution" WHERE "isActive" = true);
