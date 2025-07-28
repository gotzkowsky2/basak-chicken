import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function NoticesPage() {
  const cookieStore = cookies();
  const employeeAuth = cookieStore.get("employee_auth");

  if (!employeeAuth) {
    redirect("/employee/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">주의사항</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            <div className="border-l-4 border-yellow-400 pl-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">식품 안전</h2>
              <p className="text-gray-700">
                모든 식재료는 적절한 온도에서 보관하고, 유통기한을 철저히 확인하세요. 
                손 씻기는 기본 위생 수칙을 반드시 지켜주세요.
              </p>
            </div>
            
            <div className="border-l-4 border-red-400 pl-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">안전 수칙</h2>
              <p className="text-gray-700">
                조리 도구 사용 시 주의를 기울이고, 뜨거운 기구나 기름을 다룰 때는 
                특별히 신중하게 작업하세요. 화상 사고를 예방하기 위해 보호 장비를 착용하세요.
              </p>
            </div>
            
            <div className="border-l-4 border-blue-400 pl-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">고객 서비스</h2>
              <p className="text-gray-700">
                고객과의 상호작용 시 친절하고 정중한 태도를 유지하세요. 
                고객의 요청사항을 정확히 파악하고 신속하게 대응해주세요.
              </p>
            </div>
            
            <div className="border-l-4 border-green-400 pl-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">작업 환경</h2>
              <p className="text-gray-700">
                작업 공간을 항상 깨끗하게 유지하고, 사용한 도구는 제자리에 정리하세요. 
                효율적인 작업을 위해 정리정돈을 습관화하세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 