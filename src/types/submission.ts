export interface SubmissionHistory {
  id: string;
  employeeId: string;
  employeeName: string;
  templateId: string;
  templateName: string;
  workplace: string;
  timeSlot: string;
  date: string;
  isCompleted: boolean;
  isSubmitted: boolean;
  completedAt: string;
  submittedAt: string;
  progress: {
    mainItems: number;
    totalMainItems: number;
    connectedItems: number;
    totalConnectedItems: number;
  };
  collaboratingEmployees: Array<{
    name: string;
    count: number;
  }>;
  details: {
    mainItems: Array<{
      id: string;
      content: string;
      isCompleted: boolean;
      completedAt: string;
      notes: string;
      completedBy?: string;
    }>;
    connectedItems: Array<{
      id: string;
      itemId: string;
      parentItemId: string | null;
      type: 'inventory' | 'precaution' | 'manual';
      title: string;
      isCompleted: boolean;
      completedAt: string;
      notes: string;
      previousStock?: number;
      updatedStock?: number;
      completedBy?: string;
    }>;
  };
}

export interface SubmissionFilter {
  employeeId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  templateId?: string;
  workplace?: string;
  timeSlot?: string;
  isCompleted?: boolean;
  isSubmitted?: boolean;
}

export interface SubmissionStats {
  totalSubmissions: number;
  completedSubmissions: number;
  completionRate: number;
  totalEmployees: number;
  activeEmployees: number;
  averageCompletionTime: number;
} 