"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

export default function AdminDashboardClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handler = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener("pageshow", handler);
    return () => window.removeEventListener("pageshow", handler);
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("관리자 로그아웃 fetch 실행 전");
      const res = await fetch("/api/admin/logout", { method: "POST", credentials: "include", keepalive: true });
      console.log("관리자 로그아웃 fetch 실행 후", res);
      window.location.href = "/employee/login";
    } catch (e) {
      setError("서버 오류가 발생했습니다.");
      console.log("관리자 로그아웃 fetch 에러", e);
    } finally {
      setLoading(false);
      console.log("관리자 handleLogout finally");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 flex flex-col gap-8">
        <div className="flex justify-between items-center mb-4">
        </div>
        {error && <div className="text-red-500 text-sm text-center mb-2">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link href="/admin/employees" className="flex flex-col items-center justify-center p-6 rounded-lg shadow border hover:bg-blue-50 transition">
            <span className="text-lg font-semibold text-blue-700">직원 관리</span>
            <span className="text-sm text-gray-500 mt-2">직원 추가/수정/삭제</span>
          </Link>
          <Link href="/admin/checklists" className="flex flex-col items-center justify-center p-6 rounded-lg shadow border hover:bg-green-50 transition">
            <span className="text-lg font-semibold text-green-700">체크리스트 관리</span>
            <span className="text-sm text-gray-500 mt-2">체크리스트 생성/수정/삭제</span>
          </Link>
          <Link href="/admin/submissions" className="flex flex-col items-center justify-center p-6 rounded-lg shadow border hover:bg-yellow-50 transition">
            <span className="text-lg font-semibold text-yellow-700">제출 현황</span>
            <span className="text-sm text-gray-500 mt-2">직원별 체크리스트 제출 내역</span>
          </Link>
        </div>
      </div>
    </main>
  );
} 