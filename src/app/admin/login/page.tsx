"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "로그인 실패");
      } else {
        // 로그인 성공: 관리자 대시보드로 이동
        router.push("/admin");
      }
    } catch (err) {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8 flex flex-col gap-6">
        <h2 className="text-xl font-bold text-center text-gray-800">관리자 로그인</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="아이디"
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder-gray-600"
            value={employeeId}
            onChange={e => setEmployeeId(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder-gray-600"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
          {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}
        </form>
        <div className="text-center mt-2">
          <a href="/admin/forgot-password" className="text-blue-600 hover:underline text-sm font-medium">비밀번호를 잊으셨나요?</a>
        </div>
      </div>
    </main>
  );
} 