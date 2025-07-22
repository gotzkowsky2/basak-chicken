"use client";
import React from "react";
import EmployeeForm from "./EmployeeForm";
import { Employee, UpdateEmployeeData } from "@/types/employee";

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSubmit: (id: string, data: UpdateEmployeeData) => Promise<void>;
}

export default function EditEmployeeModal({ isOpen, onClose, employee, onSubmit }: EditEmployeeModalProps) {
  if (!isOpen || !employee) return null;

  const handleSubmit = async (data: any) => {
    // password는 수정하지 않으므로 제외
    const { password, ...updateData } = data;
    await onSubmit(employee.id, updateData);
    onClose(); // 성공 시 모달 닫기
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">직원 수정</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <EmployeeForm 
          onSubmit={handleSubmit} 
          initialData={{
            employeeId: employee.employeeId,
            name: employee.name,
            email: employee.email || "",
            phone: employee.phone || "",
            department: employee.department,
            position: employee.position,
          }}
          isEdit={true}
        />
      </div>
    </div>
  );
} 