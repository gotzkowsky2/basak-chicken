"use client";
import Link from "next/link";
import { useCallback, useState, useEffect } from "react";

interface Employee {
  name: string;
  department: string;
  position: string;
  isSuperAdmin: boolean;
}

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await fetch("/api/employee/me", { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          setEmployee(data);
        }
      } catch (error) {
        console.error("직원 정보 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, []);

  const handleLogout = useCallback(async () => {
    await fetch("/api/employee/logout", { method: "POST", credentials: "include", keepalive: true });
    window.location.href = "/employee/login";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <Link href="/employee" className="flex items-center gap-2 text-green-700 hover:text-green-900 font-bold text-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125h3.375a1.125 1.125 0 001.125-1.125V16.5a1.125 1.125 0 011.125-1.125h2.25A1.125 1.125 0 0115.75 16.5v3.375c0 .621.504 1.125 1.125 1.125h3.375a1.125 1.125 0 001.125-1.125V9.75" />
          </svg>
          <span className="text-2xl">🧑‍🍳</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {!loading && employee && (
            <div className="text-sm text-gray-600 hidden sm:block">
              <div className="font-medium">{employee.name}님</div>
              <div className="text-xs text-gray-500">{employee.department} • {employee.position}</div>
            </div>
          )}
          
          {/* 관리자인 경우에만 관리자 페이지로 이동하는 아이콘 표시 */}
          {!loading && employee && employee.isSuperAdmin && (
            <Link 
              href="/admin" 
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="관리자 페이지로 이동"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
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