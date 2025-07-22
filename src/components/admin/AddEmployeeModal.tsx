"use client";
import React from "react";
import EmployeeForm from "./EmployeeForm";
import { CreateEmployeeData } from "@/types/employee";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEmployeeData) => Promise<void>;
}

export default function AddEmployeeModal({ isOpen, onClose, onSubmit }: AddEmployeeModalProps) {
  if (!isOpen) return null;

  const handleSubmit = async (data: CreateEmployeeData) => {
    await onSubmit(data);
    onClose(); // 성공 시 모달 닫기
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">직원 추가</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <EmployeeForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
} 