CREATE INDEX IF NOT EXISTS idx_inventoryitem_active_lastupdated ON "InventoryItem" ("isActive", "lastUpdated");
CREATE INDEX IF NOT EXISTS idx_inventoryitem_active_createdat ON "InventoryItem" ("isActive", "createdAt");
CREATE INDEX IF NOT EXISTS idx_inventorycheck_item_checkedat ON "InventoryCheck" ("itemId", "checkedAt");
