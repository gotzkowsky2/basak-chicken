export default function EmployeeChecklistPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8 flex flex-col gap-6">
        <h2 className="text-xl font-bold text-gray-800">오늘의 체크리스트</h2>
        <p className="text-gray-600">준비/진행/마감, 홀/부엌 체크리스트를 확인하고 제출할 수 있습니다.</p>
      </div>
    </main>
  );
} 