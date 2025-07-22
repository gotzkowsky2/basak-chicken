"use client";
import React, { useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { CreateEmployeeData, DEPARTMENT_OPTIONS, POSITION_OPTIONS } from "@/types/employee";

interface EmployeeFormProps {
  onSubmit: (data: CreateEmployeeData & { isActive?: boolean; password?: string }) => Promise<void>;
  initialData?: Partial<CreateEmployeeData & { isActive?: boolean }>;
  isEdit?: boolean;
}

type FormData = CreateEmployeeData & { isActive?: boolean };

export default function EmployeeForm({ onSubmit, initialData, isEdit = false }: EmployeeFormProps) {
  const [form, setForm] = useState<FormData>({
    employeeId: initialData?.employeeId || "",
    password: initialData?.password || "",
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    department: initialData?.department || "홀",
    position: initialData?.position || "준비조",
    isActive: initialData?.isActive ?? true,
    isSuperAdmin: initialData?.isSuperAdmin ?? false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleToggleActive = () => {
    setForm(prev => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleToggleSuperAdmin = () => {
    setForm(prev => ({ ...prev, isSuperAdmin: !prev.isSuperAdmin }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!form.employeeId.trim()) newErrors.employeeId = "직원 아이디를 입력하세요";
    if (!isEdit && !form.password.trim()) newErrors.password = "비밀번호를 입력하세요";
    if (!form.name.trim()) newErrors.name = "이름을 입력하세요";
    if (!form.department) newErrors.department = "부서를 선택하세요";
    if (!form.position) newErrors.position = "직책을 선택하세요";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // 수정 모드에서 비밀번호가 비어있으면 제외
      const submitData: CreateEmployeeData & { isActive?: boolean; password?: string } = { ...form };
      if (isEdit && !submitData.password?.trim()) {
        delete (submitData as any).password;
      }
      
      await onSubmit(submitData);
      if (!isEdit) {
        // Reset form only for create mode
        setForm({
          employeeId: "",
          password: "",
          name: "",
          email: "",
          phone: "",
          department: "홀",
          position: "준비조",
          isActive: true,
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <Input
          name="employeeId"
          value={form.employeeId}
          onChange={handleChange}
          placeholder="직원 아이디"
          required
          disabled={isEdit}
          error={errors.employeeId}
        />
        <Input
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder={isEdit ? "비밀번호 (변경시에만 입력)" : "비밀번호"}
          type="password"
          required={!isEdit}
          error={errors.password}
        />
        <Input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="이름"
          required
          error={errors.name}
        />
        <Input
          name="email"
          value={form.email || ""}
          onChange={handleChange}
          placeholder="이메일(선택)"
          type="email"
          error={errors.email}
        />
        <Input
          name="phone"
          value={form.phone || ""}
          onChange={handleChange}
          placeholder="전화번호(선택)"
          type="tel"
          error={errors.phone}
        />
        <Select
          name="department"
          value={form.department}
          onChange={handleChange}
          options={DEPARTMENT_OPTIONS}
          required
          error={errors.department}
        />
        <Select
          name="position"
          value={form.position}
          onChange={handleChange}
          options={POSITION_OPTIONS}
          required
          error={errors.position}
        />
        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? "처리 중..." : (isEdit ? "수정" : "직원 추가")}
        </Button>
      </div>

      {/* 활성/비활성 토글 */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
          <label className="text-sm font-medium text-gray-700">계정 상태</label>
          <p className="text-xs text-gray-500">
            {form.isActive ? "활성 - 로그인 가능" : "비활성 - 로그인 불가"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggleActive}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            form.isActive ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              form.isActive ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      {/* 최고 관리자 토글 */}
      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
        <div>
          <label className="text-sm font-medium text-yellow-700">최고 관리자</label>
          <p className="text-xs text-yellow-600">체크 시 관리자 페이지 접근 가능</p>
        </div>
        <button
          type="button"
          onClick={handleToggleSuperAdmin}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            form.isSuperAdmin ? 'bg-yellow-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              form.isSuperAdmin ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </form>
  );
} 