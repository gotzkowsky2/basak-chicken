"use client";
import { memo, useMemo } from "react";

interface ChecklistProgressBarProps {
  completed: number;
  total: number;
  className?: string;
}

function ChecklistProgressBar({ 
  completed, 
  total, 
  className = "" 
}: ChecklistProgressBarProps) {
  const percentage = useMemo(() => (total > 0 ? (completed / total) * 100 : 0), [completed, total]);

  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-700">진행 상황</span>
        <span className="text-xs text-gray-500">
          {completed} / {total} 완료
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

export default memo(ChecklistProgressBar);