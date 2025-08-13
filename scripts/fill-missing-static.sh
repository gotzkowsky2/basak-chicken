#!/bin/bash
set -euo pipefail

BASE_URL=${1:-"http://localhost:3001"}

ROUTES=(
  "/"
  "/employee/login"
  "/employee"
  "/employee/inventory"
  "/employee/favorites"
  "/employee/submissions"
  "/admin"
  "/admin/checklists/new"
  "/admin/inventory"
)

echo "🔎 최신 CSS 파일 탐색..."
LATEST_CSS=$(ls -1t .next/static/css/*.css 2>/dev/null | head -n1 || true)
if [ -z "$LATEST_CSS" ]; then
  echo "❌ .next/static/css 내 CSS 파일을 찾을 수 없습니다. 먼저 빌드를 수행하세요."
  exit 1
fi
echo "✅ 최신 CSS: $LATEST_CSS"

ensure_file_for() {
  local rel_path="$1" # e.g., /_next/static/css/abc.css
  # Next.js는 URL '/_next'를 로컬 '.next' 디렉터리에서 서빙함
  local mapped_path=".next${rel_path#/_next}"
  if [ -f "$mapped_path" ]; then
    echo "✔ 존재(.next): $rel_path"
  else
    echo "➕ 생성(.next): $rel_path → 최신 CSS로 복제"
    mkdir -p "$(dirname "$mapped_path")"
    cp -f "$LATEST_CSS" "$mapped_path"
  fi
}

echo "🧩 페이지별 HTML에서 CSS 링크 추출 및 보완..."
for route in "${ROUTES[@]}"; do
  echo "-- 처리 중: $route"
  HTML=$(curl -fsSL "${BASE_URL}${route}" || true)
  if [ -z "$HTML" ]; then
    echo "(경고) HTML 응답 없음: $route"
    continue
  fi
  echo "$HTML" | grep -oE '/_next/static/css/[^"\\n]+\.css' | sort -u | while read -r css; do
    ensure_file_for "$css"
  done
done

echo "🎉 완료: 요청된 구 해시 CSS 파일이 없을 경우 최신 CSS로 채워넣었습니다."


