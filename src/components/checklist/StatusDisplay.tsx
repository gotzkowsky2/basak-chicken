"use client";

interface StatusDisplayProps {
  status: string;
  progress?: string;
  className?: string;
}

export default function StatusDisplay({ status, progress, className = "" }: StatusDisplayProps) {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case '미시작':
        return {
          icon: '⭕',
          label: '미시작',
          color: 'bg-gray-100 text-gray-800'
        };
      case '진행중':
        return {
          icon: '🔄',
          label: '진행중',
          color: 'bg-yellow-100 text-yellow-800'
        };
      case '완료':
        return {
          icon: '✅',
          label: '완료',
          color: 'bg-blue-100 text-blue-800'
        };
      case '제출 완료':
        return {
          icon: '📤',
          label: '제출 완료',
          color: 'bg-green-100 text-green-800'
        };
      default:
        return {
          icon: '❓',
          label: status,
          color: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const statusInfo = getStatusInfo(status);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
        {statusInfo.icon} {statusInfo.label}
      </span>
      {progress && (
        <span className="text-sm text-gray-600">
          ({progress})
        </span>
      )}
    </div>
  );
} 