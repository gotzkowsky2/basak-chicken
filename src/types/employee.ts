export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email?: string;
  phone?: string;
  department: string;
  position: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeData {
  employeeId: string;
  password: string;
  name: string;
  email?: string;
  phone?: string;
  department: string;
  position: string;
}

export interface UpdateEmployeeData {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  isActive?: boolean;
}

export const DEPARTMENT_OPTIONS = [
  { value: "홀", label: "홀" },
  { value: "부엌", label: "부엌" },
  { value: "유동적", label: "유동적" },
];

export const POSITION_OPTIONS = [
  { value: "준비조", label: "준비조" },
  { value: "진행조", label: "진행조" },
  { value: "마감조", label: "마감조" },
  { value: "유동적", label: "유동적" },
]; 