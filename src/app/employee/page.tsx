import { redirect } from "next/navigation";

export default function EmployeeEntry() {
  // 직원 메인 진입 시 바로 체크리스트로 이동 (인증 여부는 미들웨어에서 처리)
  redirect("/employee/checklist");
} 