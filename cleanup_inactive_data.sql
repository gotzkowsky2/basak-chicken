-- 비활성화된 데이터 완전 삭제 스크립트
-- 실행 전 반드시 백업을 확인하세요!

-- 1. 비활성화된 체크리스트 템플릿 삭제
DELETE FROM "ChecklistTemplate" WHERE "isActive" = false;

-- 2. 비활성화된 체크리스트 항목 삭제
DELETE FROM "ChecklistItem" WHERE "isActive" = false;

-- 3. 비활성화된 주의사항 삭제
DELETE FROM "Precaution" WHERE "isActive" = false;

-- 4. 비활성화된 메뉴얼 삭제
DELETE FROM "Manual" WHERE "isActive" = false;

-- 5. 비활성화된 재고 아이템 삭제
DELETE FROM "InventoryItem" WHERE "isActive" = false;

-- 6. 비활성화된 직원 삭제 (isActive = false인 직원들)
DELETE FROM "Employee" WHERE "isActive" = false;

-- 7. 연결된 항목 관계 테이블에서 고아 데이터 정리
-- 체크리스트 항목과 연결된 항목들 중 삭제된 항목들 정리
DELETE FROM "ChecklistItemConnectedItem" 
WHERE "itemId" NOT IN (SELECT id FROM "ChecklistItem" WHERE "isActive" = true)
   OR "connectedItemId" NOT IN (
     SELECT id FROM "Precaution" WHERE "isActive" = true
     UNION
     SELECT id FROM "Manual" WHERE "isActive" = true
     UNION
     SELECT id FROM "InventoryItem" WHERE "isActive" = true
   );

-- 8. 태그 관계 테이블에서 고아 데이터 정리
-- 체크리스트 템플릿 태그 관계
DELETE FROM "ChecklistTemplateTagRelation" 
WHERE "templateId" NOT IN (SELECT id FROM "ChecklistTemplate" WHERE "isActive" = true);

-- 주의사항 태그 관계
DELETE FROM "PrecautionTagRelation" 
WHERE "precautionId" NOT IN (SELECT id FROM "Precaution" WHERE "isActive" = true);

-- 메뉴얼 태그 관계
DELETE FROM "ManualTagRelation" 
WHERE "manualId" NOT IN (SELECT id FROM "Manual" WHERE "isActive" = true);

-- 재고 아이템 태그 관계
DELETE FROM "InventoryItemTagRelation" 
WHERE "inventoryItemId" NOT IN (SELECT id FROM "InventoryItem" WHERE "isActive" = true);

-- 9. 매뉴얼-주의사항 관계 테이블에서 고아 데이터 정리
DELETE FROM "ManualPrecautionRelation" 
WHERE "manualId" NOT IN (SELECT id FROM "Manual" WHERE "isActive" = true)
   OR "precautionId" NOT IN (SELECT id FROM "Precaution" WHERE "isActive" = true);

-- 10. 사용되지 않는 태그들 정리 (관계가 없는 태그들)
DELETE FROM "Tag" 
WHERE id NOT IN (
  SELECT DISTINCT "tagId" FROM "ChecklistTemplateTagRelation"
  UNION
  SELECT DISTINCT "tagId" FROM "PrecautionTagRelation"
  UNION
  SELECT DISTINCT "tagId" FROM "ManualTagRelation"
  UNION
  SELECT DISTINCT "tagId" FROM "InventoryItemTagRelation"
);

-- 완료 메시지
SELECT '비활성화된 데이터 정리가 완료되었습니다.' as message;
