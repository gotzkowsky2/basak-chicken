"use client";

import { useEffect, useRef } from "react";

/**
 * CSS/JS 로드 실패를 감지해 1회만 캐시버스트 리로드를 수행하는 가드.
 * - 조건: body에 Tailwind 유틸 클래스가 적용되지 않았거나, 주요 CSS 링크가 0개인 경우
 */
export default function CssGuard() {
  const retriedRef = useRef(false);

  useEffect(() => {
    try {
      const hasTailwindClass = document.body.className.length > 0;
      const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
      const hasNextCss = cssLinks.some((l) => l.href.includes('/_next/static/css/'));

      if ((!hasTailwindClass || !hasNextCss) && !retriedRef.current) {
        retriedRef.current = true;
        const url = new URL(window.location.href);
        url.searchParams.set("v", Date.now().toString());
        window.location.replace(url.toString());
      }
    } catch {
      // no-op
    }
  }, []);

  return null;
}



