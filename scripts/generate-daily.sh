#!/bin/bash
set -euo pipefail

# Ensure KST
export TZ=Asia/Seoul

APP_URL="http://127.0.0.1:3001"
DATE_KST=$(date +%F)
LOG_DIR="/root/basak-chicken-app/logs"
mkdir -p "$LOG_DIR"

echo "[$(date '+%F %T %z')] generate-daily start for date=$DATE_KST" >> "$LOG_DIR/generate-daily.log"

# Trigger daily generation; API is idempotent by unique(templateId,date)
HTTP_CODE=$(curl -s -o /tmp/generate-daily.out -w "%{http_code}" -X POST "$APP_URL/api/admin/generate-daily?date=$DATE_KST") || true

echo "[$(date '+%F %T %z')] response_code=$HTTP_CODE body=$(cat /tmp/generate-daily.out)" >> "$LOG_DIR/generate-daily.log"

rm -f /tmp/generate-daily.out || true


