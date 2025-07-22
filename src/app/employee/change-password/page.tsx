"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function EmployeeChangePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!password.trim() || password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/employee/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "비밀번호 변경 실패");
      } else {
        setSuccess("비밀번호가 성공적으로 변경되었습니다. 다시 로그인해 주세요.");
        setTimeout(() => {
          router.push("/employee/login");
        }, 2000);
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
        <h2 className="text-xl font-bold text-center text-gray-800">비밀번호 변경</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="새 비밀번호 (6자 이상)"
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800 placeholder-gray-600"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="비밀번호 확인"
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800 placeholder-gray-600"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
            disabled={loading}
          >
            {loading ? "변경 중..." : "비밀번호 변경"}
          </button>
        </form>
        {success && <div className="text-green-600 text-sm text-center mt-2">{success}</div>}
        {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}
      </div>
    </main>
  );
} 