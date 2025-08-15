export default function AdminChoosePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col gap-6 items-center">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">관리자 메뉴 선택</h1>
        <div className="flex flex-col gap-4 w-full">
          <a href="/admin" className="w-full py-3 px-4 rounded-lg bg-blue-600 text-white text-center font-semibold hover:bg-blue-700 transition">관리자 페이지로 이동</a>
          <a href="/employee" className="w-full py-3 px-4 rounded-lg bg-green-600 text-white text-center font-semibold hover:bg-green-700 transition">직원 페이지로 이동</a>
        </div>
      </div>
    </main>
  );
}