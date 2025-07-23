"use client";
import React, { useState } from "react";

export default function EmployeeForgotPasswordPage() {
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/employee/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "이메일 전송 실패");
      } else {
        setMessage("입력하신 이메일로 비밀번호 재설정 안내가 발송되었습니다.");
        window.setTimeout(() => {
          window.location.href = "/employee/login";
        }, 1000);
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
        <h2 className="text-xl font-bold text-center text-gray-800">비밀번호 찾기</h2>
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
            type="email"
            placeholder="이메일"
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800 placeholder-gray-600"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
            disabled={loading}
          >
            {loading ? "이메일 전송 중..." : "이메일로 비밀번호 재설정"}
          </button>
        </form>
        {message && <div className="text-green-600 text-sm text-center mt-2">{message}</div>}
        {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}
      </div>
    </main>
  );
} 