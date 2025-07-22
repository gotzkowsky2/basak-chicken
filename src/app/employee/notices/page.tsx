import React from "react";
import Link from "next/link";

export default function EmployeeNotices() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8 flex flex-col gap-8">
        <h1 className="text-2xl font-bold text-center text-yellow-700">직원 주의사항</h1>
        <ul className="flex flex-col gap-4">
          <li className="p-4 rounded-lg bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 shadow">
            - 근무 전 손 소독 및 위생복 착용을 꼭 확인하세요.
          </li>
          <li className="p-4 rounded-lg bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 shadow">
            - 체크리스트 항목을 빠짐없이 확인하고 제출하세요.
          </li>
          <li className="p-4 rounded-lg bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 shadow">
            - 이상 발생 시 즉시 관리자에게 보고하세요.
          </li>
        </ul>
        <Link href="/employee" className="mt-6 text-blue-600 hover:underline text-center">← 메인으로 돌아가기</Link>
      </div>
    </main>
  );
} 