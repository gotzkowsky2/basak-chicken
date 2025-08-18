"use client";

import Link from "next/link";
import { useCallback, useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface Employee {
  name: string;
  department: string;
  position: string;
  isSuperAdmin: boolean;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!showMenu) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleLogout = useCallback(async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include", keepalive: true });
    // 로그아웃 직후 상단 메뉴/사용자 정보가 보이지 않도록 즉시 UI 초기화
    setEmployee(null);
    setShowMenu(false);
    window.location.replace("/employee/login");
  }, []);

  // 로그인 페이지에서는 상단 메뉴/헤더를 완전히 숨김
  if (isLoginPage) {
    return <main>{children}</main>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        {/* 홈 아이콘 */}
        <div className="flex items-center gap-3">
          <Link href="/admin" className="home-icon flex items-center gap-2 text-blue-700 hover:text-blue-900 active:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-1 -m-1 font-bold text-lg transition-all duration-150">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125h3.375a1.125 1.125 0 001.125-1.125V16.5a1.125 1.125 0 011.125-1.125h2.25A1.125 1.125 0 0115.75 16.5v3.375c0 .621.504 1.125 1.125 1.125h3.375a1.125 1.125 0 001.125-1.125V9.75" />
            </svg>
          </Link>
          
          {/* 대시보드 메뉴 드롭다운 */}
          {!!employee && (
          <div className="relative">
            <button
              ref={menuButtonRef}
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-150 min-h-[44px] min-w-[44px]"
              title="대시보드 메뉴"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              <span>메뉴</span>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showMenu && (
              <div ref={menuRef} className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[9999]">
                <Link 
                  href="/admin/employees" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100 focus:outline-none focus:bg-blue-50 transition-all duration-150 cursor-pointer min-h-[44px]"
                  onClick={() => setShowMenu(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                  직원 관리
                </Link>
                <Link 
                  href="/admin/messages" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 active:bg-indigo-100 focus:outline-none focus:bg-indigo-50 transition-all duration-150 cursor-pointer min-h-[44px]"
                  onClick={() => setShowMenu(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.922l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.915a2.25 2.25 0 01-1.07-1.922V6.75" />
                  </svg>
                  메시지
                </Link>
                <Link 
                  href="/admin/checklists" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 active:bg-green-100 focus:outline-none focus:bg-green-50 transition-all duration-150 cursor-pointer min-h-[44px]"
                  onClick={() => setShowMenu(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  체크리스트 관리
                </Link>
                <Link 
                  href="/admin/notices" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-700 active:bg-red-100 focus:outline-none focus:bg-red-50 transition-all duration-150 cursor-pointer min-h-[44px]"
                  onClick={() => setShowMenu(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  공지사항 관리
                </Link>
                <Link 
                  href="/admin/dev-checklist-generator" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 active:bg-yellow-100 focus:outline-none focus:bg-yellow-50 transition-all duration-150 cursor-pointer min-h-[44px]"
                  onClick={() => setShowMenu(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                  🧪 개발용 체크리스트 생성기
                </Link>
                <Link 
                  href="/admin/precautions" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 active:bg-orange-100 focus:outline-none focus:bg-orange-50 transition-all duration-150 cursor-pointer min-h-[44px]"
                  onClick={() => setShowMenu(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  주의사항 관리
                </Link>
                <Link 
                  href="/admin/manuals" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 active:bg-indigo-100 focus:outline-none focus:bg-indigo-50 transition-all duration-150 cursor-pointer min-h-[44px]"
                  onClick={() => setShowMenu(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                  메뉴얼 관리
                </Link>
                <Link 
                  href="/admin/inventory" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-700 active:bg-teal-100 focus:outline-none focus:bg-teal-50 transition-all duration-150 cursor-pointer min-h-[44px]"
                  onClick={() => setShowMenu(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                  재고/구매 관리
                </Link>
                <Link 
                  href="/admin/tags" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 active:bg-purple-100 focus:outline-none focus:bg-purple-50 transition-all duration-150 cursor-pointer min-h-[44px]"
                  onClick={() => setShowMenu(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m-6 3l3 3m0 0l3-3m-3 3V1.5m6 9h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-.75" />
                  </svg>
                  태그 관리
                </Link>
                <Link 
                  href="/admin/submissions" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 active:bg-yellow-100 focus:outline-none focus:bg-yellow-50 transition-all duration-150 cursor-pointer min-h-[44px]"
                  onClick={() => setShowMenu(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                  제출 현황
                </Link>
              </div>
            )}
          </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {!loading && employee && (
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600 hidden sm:block">
                <div className="font-medium">{employee.name}님 {employee.isSuperAdmin ? '(최고관리자)' : '(관리자)'}</div>
                <div className="text-xs text-gray-500">{employee.department} • {employee.position}</div>
              </div>
              
              {/* 관리자 아이콘 */}
              <span className="text-2xl">👑</span>
            </div>
          )}
          
          {/* 관리자인 경우에만 직원 페이지로 이동하는 아이콘 표시 */}
          {!loading && employee && employee.isSuperAdmin && (
            <Link 
              href="/employee" 
              className="p-3 text-gray-600 hover:text-green-600 hover:bg-green-50 active:text-green-700 active:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-lg transition-all duration-150 min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="직원 페이지로 이동"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </Link>
          )}
          
          {!!employee && (
            <button
              onClick={handleLogout}
              className="p-3 text-gray-600 hover:text-red-600 hover:bg-red-50 active:text-red-700 active:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-lg transition-all duration-150 min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="로그아웃"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </button>
          )}
        </div>
      </header>
      
      {/* 드롭다운 메뉴 외부 클릭 시 닫기 */}
      {/* 외부 클릭 감지는 useEffect에서 처리하므로 이 부분은 삭제 */}
      
      <main>
        {children}
        <div className="text-center text-xs text-gray-400 py-6">Build: {new Date().toLocaleString('ko-KR')}</div>
      </main>
    </div>
  );
} 