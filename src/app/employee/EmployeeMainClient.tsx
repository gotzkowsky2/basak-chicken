"use client";
import Link from "next/link";
import React from "react";

export default function EmployeeMainClient() {

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8 flex flex-col gap-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/employee/checklist" className="flex flex-col items-center justify-center p-6 rounded-lg shadow border hover:bg-green-50 active:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-150 min-h-[120px]">
            <span className="text-lg font-semibold text-green-700">오늘의 체크리스트</span>
            <span className="text-sm text-gray-500 mt-2">준비/진행/마감, 홀/부엌</span>
          </Link>
          <Link href="/employee/submissions" className="flex flex-col items-center justify-center p-6 rounded-lg shadow border hover:bg-blue-50 active:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-150 min-h-[120px]">
            <span className="text-lg font-semibold text-blue-700">내 제출 내역</span>
            <span className="text-sm text-gray-500 mt-2">체크리스트 제출 기록</span>
          </Link>
          <Link href="/employee/notices" className="flex flex-col items-center justify-center p-6 rounded-lg shadow border hover:bg-yellow-50 active:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-150 min-h-[120px]">
            <span className="text-lg font-semibold text-yellow-700">주의사항</span>
            <span className="text-sm text-gray-500 mt-2">업무 전 꼭 확인!</span>
          </Link>
          <Link href="/employee/inventory" className="flex flex-col items-center justify-center p-6 rounded-lg shadow border hover:bg-orange-50 active:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-150 min-h-[120px]">
            <span className="text-lg font-semibold text-orange-700">재고관리</span>
            <span className="text-sm text-gray-500 mt-2">식자재 및 부대용품 관리</span>
          </Link>
          <Link href="/employee/manual" className="flex flex-col items-center justify-center p-6 rounded-lg shadow border hover:bg-indigo-50 active:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-150 min-h-[120px]">
            <span className="text-lg font-semibold text-indigo-700">메뉴얼</span>
            <span className="text-sm text-gray-500 mt-2">업무 가이드 및 매뉴얼</span>
          </Link>
        </div>
      </div>
    </main>
  );
} 