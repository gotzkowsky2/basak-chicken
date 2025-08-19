"use client";
import React, { useState } from "react";
import { Employee } from "@/types/employee";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

interface EmployeeListProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export default function EmployeeList({ employees, onEdit, onDelete, onAdd }: EmployeeListProps) {
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set());
  const [showInactive, setShowInactive] = useState<boolean>(true);

  const toggleEmailExpansion = (id: string) => {
    const newExpanded = new Set(expandedEmails);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedEmails(newExpanded);
  };

  const getDepartmentIcon = (department: string) => {
    switch (department) {
      case "홀":
        return "🍽️";
      case "주방":
        return "👨‍🍳";
      case "매니저":
        return "👔";
      case "유동적":
        return "🔄";
      default:
        return "👤";
    }
  };

  const getPositionIcon = (position: string) => {
    switch (position) {
      case "준비조":
        return "🌅";
      case "오픈조":
        return "🌞";
      case "마감조":
        return "🌙";
      case "유동적":
        return "🔄";
      default:
        return "👤";
    }
  };

  const getDepartmentBadgeColor = (department: string) => {
    switch (department) {
      case "홀":
        return "bg-blue-100 text-blue-800";
      case "주방":
        return "bg-orange-100 text-orange-800";
      case "매니저":
        return "bg-purple-100 text-purple-800";
      case "유동적":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPositionBadgeColor = (position: string) => {
    switch (position) {
      case "준비조":
        return "bg-yellow-100 text-yellow-800";
      case "오픈조":
        return "bg-green-100 text-green-800";
      case "마감조":
        return "bg-indigo-100 text-indigo-800";
      case "유동적":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const visibleEmployees = employees.filter(e => showInactive ? true : e.isActive);


  if (visibleEmployees.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <PlusIcon className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">직원이 없습니다</h3>
        <p className="text-gray-500 mb-4">첫 번째 직원을 추가해보세요</p>
        <button
          onClick={onAdd}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          직원 추가
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 모바일에서는 카드 형태, 데스크톱에서는 테이블 형태 */}
      {/* 임시 조치: 데스크톱에서도 카드 레이아웃 노출 (테이블 가려서 공백 문제 방지) */}
      <div className="block">
        {visibleEmployees.map((employee) => (
          <div
            key={employee.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {employee.name}
                  </h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.isActive ? '활성' : '비활성'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">ID: {employee.employeeId}</p>
                
                {employee.email && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">이메일:</span>{" "}
                    {expandedEmails.has(employee.id) ? (
                      <span className="break-all">{employee.email}</span>
                    ) : (
                      <span className="truncate block">
                        {employee.email.length > 30
                          ? `${employee.email.substring(0, 30)}...`
                          : employee.email}
                      </span>
                    )}
                    {employee.email.length > 30 && (
                      <button
                        onClick={() => toggleEmailExpansion(employee.id)}
                        className="text-blue-600 hover:text-blue-800 text-xs ml-1"
                      >
                        {expandedEmails.has(employee.id) ? "접기" : "더보기"}
                      </button>
                    )}
                  </div>
                )}
                
                {employee.phone && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">전화:</span> {employee.phone}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => onEdit(employee)}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 sm:px-3 sm:py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
                  title="수정"
                >
                  <PencilIcon className="w-4 h-4" /> <span className="hidden sm:inline">수정</span>
                </button>
                {/* 메시지 기능 제거됨 */}
                <button
                  onClick={() => onDelete(employee.id)}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 sm:px-3 sm:py-1 rounded bg-red-50 text-red-700 hover:bg-red-100"
                  title="삭제"
                >
                  <TrashIcon className="w-4 h-4" /> <span className="hidden sm:inline">삭제</span>
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDepartmentBadgeColor(employee.department)}`}>
                <span className="mr-1">{getDepartmentIcon(employee.department)}</span>
                부:{employee.department}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPositionBadgeColor(employee.position)}`}>
                <span className="mr-1">{getPositionIcon(employee.position)}</span>
                직:{employee.position}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 메시지 기능 제거됨 */}

      {/* 데스크톱 테이블 */}
      {/* 임시 비활성화: 원인 규명 전까지 테이블 레이아웃 숨김 */}
      <div className="hidden">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  직원 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  연락처
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  부서/직책
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visibleEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {employee.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {employee.employeeId}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {employee.email || "-"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {employee.phone || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDepartmentBadgeColor(employee.department)}`}>
                        <span className="mr-1">{getDepartmentIcon(employee.department)}</span>
                        부:{employee.department}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPositionBadgeColor(employee.position)}`}>
                        <span className="mr-1">{getPositionIcon(employee.position)}</span>
                        직:{employee.position}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.isActive ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(employee)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(employee.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 