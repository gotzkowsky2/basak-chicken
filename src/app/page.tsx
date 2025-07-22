import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-center text-gray-800">Basak Chicken 직원 관리 시스템</h1>
        <div className="flex flex-col gap-4">
          <Link href="/admin/login" className="w-full py-3 px-4 rounded-lg bg-blue-600 text-white text-center font-semibold hover:bg-blue-700 transition">관리자 로그인</Link>
          <Link href="/employee/login" className="w-full py-3 px-4 rounded-lg bg-green-600 text-white text-center font-semibold hover:bg-green-700 transition">직원 로그인</Link>
        </div>
      </div>
      <footer className="mt-8 text-gray-400 text-xs text-center">© 2024 Basak Chicken</footer>
    </main>
  );
}
