export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold text-gray-900">404</h1>
        <p className="text-lg text-gray-900 mt-3">페이지를 찾을 수 없습니다.</p>
        <a href="/" className="inline-block mt-6 px-5 py-2.5 bg-gray-900 text-white rounded-lg font-semibold">홈으로</a>
      </div>
    </div>
  );
}

