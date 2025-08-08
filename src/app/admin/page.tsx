"use client";
import { useEffect } from "react";

export default function AdminEntry() {
  useEffect(() => {
    // 아주 가벼운 클라이언트 가드: 서버 미들웨어가 주 가드이지만, 사용성 보완
    if (typeof document !== "undefined") {
      const hasAdmin = document.cookie.includes("admin_auth=");
      const hasSuper = document.cookie.includes("superadmin_auth=");
      const hasEmployee = document.cookie.includes("employee_auth=");
      if (!hasAdmin && !hasSuper && !hasEmployee) {
        window.location.replace("/employee/login");
      }
    }
  }, []);

  return null;
} 