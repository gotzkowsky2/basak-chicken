"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmployeeLoginPage() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof document !== "undefined") {
      const cookies = document.cookie.split(';').map(c => c.trim());
      const hasAuth = cookies.some(c => c.startsWith("employee_auth="));
      if (hasAuth) {
        // 이미 로그인된 상태면 안내만 띄우고, 서버에 me API로 분기
        fetch("/api/employee/me", { credentials: "include" })
          .then(res => res.json())
          .then(data => {
            setAlreadyLoggedIn(true);
            if (data.isSuperAdmin) setRedirectTo("/admin-choose");
            else setRedirectTo("/employee");
          })
          .catch(() => {
            setAlreadyLoggedIn(true);
            setRedirectTo("/employee");
          });
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/employee/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, password }),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "로그인 실패");
      } else if (data.redirectTo) {
        router.push(data.redirectTo);
      } else if (data.isTempPassword) {
        router.push("/employee/change-password");
      } else if (data.isSuperAdmin) {
        router.push("/admin-choose");
      } else {
        router.push("/employee");
      }
    } catch (err) {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (alreadyLoggedIn) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8 flex flex-col gap-6 items-center">
          <h2 className="text-xl font-bold text-center text-gray-800">이미 로그인된 상태입니다.</h2>
          <button
            className="w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            onClick={() => redirectTo && router.push(redirectTo)}
          >
            메인으로 이동
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8 flex flex-col gap-6">
        <h2 className="text-xl font-bold text-center text-gray-800">직원 로그인</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="직원 아이디"
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800 placeholder-gray-600"
            value={employeeId}
            onChange={e => setEmployeeId(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800 placeholder-gray-600"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
            disabled={loading}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
          {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}
        </form>
        <div className="text-center mt-2">
          <a href="/employee/forgot-password" className="text-green-600 hover:underline text-sm font-medium">비밀번호를 잊으셨나요?</a>
        </div>
      </div>
    </main>
  );
} 