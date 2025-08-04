export interface ChecklistTemplate {
  id: string;
  name: string; // 템플릿 이름 사용
  content: string;
  workplace: string;
  category: string;
  timeSlot: string;
  items?: ChecklistItem[];
  tags?: Tag[];
  // 그룹화를 위한 추가 속성들
  groupInstances?: any[];
  isCompleted?: boolean;
  notes?: string;
}

export interface ChecklistItem {
  id: string;
  templateId: string;
  parentId?: string;
  type: string;
  content: string;
  instructions?: string;
  order: number;
  isRequired: boolean;
  isActive: boolean;
  children?: ChecklistItem[];
  connectedItems?: ChecklistItemConnection[]; // 연결된 항목들
}

export interface ChecklistItemConnection {
  id: string;
  checklistItemId: string;
  itemType: string; // "inventory", "precaution", "manual"
  itemId: string;
  order: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
}

export interface Precaution {
  id: string;
  title: string;
  content: string;
  workplace: string;
  timeSlot: string;
  priority: number;
}

export interface Manual {
  id: string;
  title: string;
  content: string;
  mediaUrls: string[];
  workplace: string;
  timeSlot: string;
  category: string;
  version: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
}

export interface ChecklistItemResponse {
  id: string;
  content: string;
  instructions?: string;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: string;
  notes?: string;
} 