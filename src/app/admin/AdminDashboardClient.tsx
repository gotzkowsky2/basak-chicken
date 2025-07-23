"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function AdminDashboardClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      if (!res.ok) {
        setError("로그아웃 실패");
      } else {
        router.push("/employee/login");
      }
    } catch (e) {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 flex flex-col gap-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">관리자 대시보드</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
            disabled={loading}
          >
            {loading ? "로그아웃 중..." : "로그아웃"}
          </button>
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