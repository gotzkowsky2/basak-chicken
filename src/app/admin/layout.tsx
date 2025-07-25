"use client";

import Link from "next/link";
import { useCallback, useState, useEffect } from "react";

interface Employee {
  name: string;
  department: string;
  position: string;
  isSuperAdmin: boolean;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await fetch("/api/admin/me", { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          setEmployee(data);
        }
      } catch (error) {
        console.error("관리자 정보 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, []);

  const handleLogout = useCallback(async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include", keepalive: true });
    window.location.href = "/employee/login";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <Link href="/admin" className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold text-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125h3.375a1.125 1.125 0 001.125-1.125V16.5a1.125 1.125 0 011.125-1.125h2.25A1.125 1.125 0 0115.75 16.5v3.375c0 .621.504 1.125 1.125 1.125h3.375a1.125 1.125 0 001.125-1.125V9.75" />
          </svg>
          <span className="text-2xl">👑</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {!loading && employee && (
            <div className="text-sm text-gray-600 hidden sm:block">
              <div className="font-medium">{employee.name}님 {employee.isSuperAdmin ? '(최고관리자)' : '(관리자)'}</div>
              <div className="text-xs text-gray-500">{employee.department} • {employee.position}</div>
            </div>
          )}
          
          {/* 관리자인 경우에만 직원 페이지로 이동하는 아이콘 표시 */}
          {!loading && employee && employee.isSuperAdmin && (
            <Link 
              href="/employee" 
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="직원 페이지로 이동"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </Link>
          )}
          
          <button
            onClick={handleLogout}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="로그아웃"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
} 