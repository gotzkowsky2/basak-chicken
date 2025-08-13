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

ensure_js_for() {
  local rel_path="$1" # e.g., /_next/static/chunks/app/employee/login/page-abcdef.js
  local local_path=".${rel_path}"
  if [ -f "$local_path" ]; then
    echo "✔ JS 존재: $rel_path"
    return
  fi
  # 동일 디렉토리의 최신 page-*.js를 찾아 복제
  local dir
  dir=$(dirname "$local_path")
  local latest_js
  latest_js=$(ls -1t "$dir"/page-*.js 2>/dev/null | head -n1 || true)
  if [ -n "$latest_js" ]; then
    echo "➕ JS 생성: $rel_path → $latest_js 복제"
    mkdir -p "$dir"
    cp -f "$latest_js" "$local_path"
  else
    echo "(경고) 대체할 page-*.js 없음: $rel_path"
  fi
}

echo "🧩 페이지별 HTML에서 JS 링크 추출 및 보완..."
for route in "${ROUTES[@]}"; do
  echo "-- 처리 중: $route"
  HTML=$(curl -fsSL "${BASE_URL}${route}" || true)
  if [ -z "$HTML" ]; then
    echo "(경고) HTML 응답 없음: $route"
    continue
  fi
  # app 라우트 page-*.js
  echo "$HTML" | grep -oE '/_next/static/chunks/app/[^"\n]*/page-[^"\n]+\.js' | sort -u | while read -r js; do
    ensure_js_for "$js"
  done
  # 공통 청크 (예: 8836-*.js 등)
  echo "$HTML" | grep -oE '/_next/static/chunks/[0-9a-zA-Z_-]+-[^"\n]+\.js' | sort -u | while read -r js; do
    local_path=".${js}"
    if [ -f "$local_path" ]; then
      echo "✔ 청크 존재: $js"
    else
      # 동일 prefix 디렉토리에서 최신 동일 prefix 파일 복제
      dir=$(dirname "$local_path")
      prefix=$(basename "$local_path" | cut -d'-' -f1)
      candidate=$(ls -1t "$dir"/${prefix}-*.js 2>/dev/null | head -n1 || true)
      if [ -n "$candidate" ]; then
        echo "➕ 청크 생성: $js → $candidate 복제"
        mkdir -p "$dir"
        cp -f "$candidate" "$local_path"
      else
        echo "(경고) 대체 청크 없음: $js"
      fi
    fi
  done
done

echo "🎉 완료: 요청된 구 해시 JS 파일이 없을 경우 최신 동등 파일로 채워넣었습니다."



