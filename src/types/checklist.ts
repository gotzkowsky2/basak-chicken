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
  groupInstances?: ChecklistInstance[];
  isCompleted?: boolean;
  isSubmitted?: boolean;
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
  itemType: 'inventory' | 'precaution' | 'manual';
  itemId: string;
  order: number;
}

// 연결된 항목의 진행 상태
export interface ConnectedItemStatus {
  connectionId: string;
  itemId: string;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: string;
  notes?: string;
  currentStock?: number;
  updatedStock?: number;
  previousStock?: number;
  stockChange?: number;
}

// 연결된 항목의 상세 정보
export interface ConnectedItemDetails {
  id: string;
  name?: string;
  title?: string;
  content?: string;
  category?: string;
  currentStock?: number;
  minStock?: number;
  unit?: string;
  supplier?: string;
  lastUpdated?: string;
  lastCheckedBy?: string;
  status?: 'low' | 'sufficient';
  isLowStock?: boolean;
  tags?: Tag[];
  precautionRelations?: Array<{
    precaution: {
      id: string;
      title: string;
      content: string;
      tags: Tag[];
    };
    order: number;
  }>;
}

// 체크리스트 인스턴스
export interface ChecklistInstance {
  id: string;
  templateId: string;
  workplace: string;
  timeSlot: string;
  date: string;
  isCompleted: boolean;
  isSubmitted: boolean;
  completedBy?: string;
  completedAt?: string;
  notes?: string;
  template?: ChecklistTemplate;
  connectedItemsProgress?: ConnectedItemProgress[];
  checklistItemProgresses?: ChecklistItemProgress[];
}

// 연결된 항목 진행 상태 (DB 스키마 기반)
export interface ConnectedItemProgress {
  id: string;
  instanceId: string;
  connectionId: string;
  itemId: string;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: string;
  notes?: string;
  currentStock?: number;
  updatedStock?: number;
}

// 체크리스트 항목 진행 상태 (DB 스키마 기반)
export interface ChecklistItemProgress {
  id: string;
  instanceId: string;
  itemId: string;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: string;
  notes?: string;
  item?: ChecklistItem;
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
  employeeId: string;
  email?: string;
  isActive: boolean;
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

// 체크리스트 상태 정보
export interface ChecklistStatus {
  status: '미시작' | '진행중' | '완료' | '제출 완료';
  color: 'gray' | 'yellow' | 'blue' | 'green';
  progress?: string;
  connectedItems?: {
    inventory: number;
    precaution: number;
    manual: number;
  };
}

// 시간대 잠금 상태
export interface TimeSlotStatus {
  workplace: string;
  timeSlot: string;
  isLocked: boolean;
  lockedBy?: string;
  department?: string;
  lockedAt?: string;
} 