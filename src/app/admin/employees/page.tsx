"use client";
import React, { useState, useEffect } from "react";
import { Employee, CreateEmployeeData } from "@/types/employee";
import EmployeeList from "@/components/admin/EmployeeList";
import EmployeeForm from "@/components/admin/EmployeeForm";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ACTIVE'|'INACTIVE'|'ALL'>('ACTIVE');

  useEffect(() => {
    fetchEmployees();
  }, [statusFilter]);

  const fetchEmployees = async () => {
    try {
      const params = new URLSearchParams();
      params.set('status', statusFilter);
      const response = await fetch(`/api/admin/employees?${params.toString()}`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      } else {
        console.error("직원 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("직원 목록 조회 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (data: CreateEmployeeData & { isActive?: boolean }) => {
    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchEmployees();
        setShowAddModal(false);
      } else {
        const errorData = await response.json();
        alert(`직원 추가 실패: ${errorData.error}`);
      }
    } catch (error) {
      console.error("직원 추가 오류:", error);
      alert("직원 추가 중 오류가 발생했습니다.");
    }
  };

  const handleEditEmployee = async (data: CreateEmployeeData & { isActive?: boolean; password?: string }) => {
    if (!editingEmployee) return;

    try {
      const response = await fetch(`/api/admin/employees/${editingEmployee.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchEmployees();
        setShowEditModal(false);
        setEditingEmployee(null);
      } else {
        const errorData = await response.json();
        alert(`직원 수정 실패: ${errorData.error}`);
      }
    } catch (error) {
      console.error("직원 수정 오류:", error);
      alert("직원 수정 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm("정말로 이 직원을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/employees/${id}`, {
        method: "DELETE",
        credentials: 'include',
      });

      if (response.ok) {
        await fetchEmployees();
      } else {
        const errorData = await response.json();
        alert(`직원 삭제 실패: ${errorData.error}`);
      }
    } catch (error) {
      console.error("직원 삭제 오류:", error);
      alert("직원 삭제 중 오류가 발생했습니다.");
    }
  };

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">직원 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">직원 관리</h1>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <label className="text-sm text-gray-600">상태</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
            >
              <option value="ACTIVE">활성</option>
              <option value="INACTIVE">비활성</option>
              <option value="ALL">전체</option>
            </select>
          </div>
        </div>

        {/* 직원 목록 */}
        <EmployeeList
          employees={employees}
          onEdit={openEditModal}
          onDelete={handleDeleteEmployee}
          onAdd={() => setShowAddModal(true)}
        />

        {/* 추가 모달 */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">직원 추가</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <EmployeeForm
                  onSubmit={handleAddEmployee}
                  isEdit={false}
                />
              </div>
            </div>
          </div>
        )}

        {/* 수정 모달 */}
        {showEditModal && editingEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">직원 수정</h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingEmployee(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <EmployeeForm
                  onSubmit={handleEditEmployee}
                  initialData={editingEmployee}
                  isEdit={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 