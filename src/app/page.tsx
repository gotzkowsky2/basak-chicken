import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col gap-6 items-center">
        <img src="/basak.jpg" alt="Basak Chicken 로고" className="w-20 h-20 mb-2 object-contain" />
        <h1 className="text-2xl font-bold text-center text-gray-800">Basak Chicken 운영 시스템</h1>
        <div className="flex flex-col gap-4 w-full">
          <Link href="/employee/login" className="w-full py-3 px-4 rounded-lg bg-blue-600 text-white text-center font-semibold hover:bg-blue-700 transition">로그인</Link>
        </div>
      </div>
      <footer className="mt-8 text-gray-400 text-xs text-center">© 2024 Basak Chicken</footer>
    </main>
  );
}
