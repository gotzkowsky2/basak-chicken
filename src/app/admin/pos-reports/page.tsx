"use client";
import { useState, useRef, useEffect } from 'react';

interface UploadedReport {
  id: string;
  filename: string;
  uploadDate: string;
  recordCount: number;
}

export default function PosReportsPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedReports, setUploadedReports] = useState<UploadedReport[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadUploadedReports();
  }, []);

  const loadUploadedReports = async () => {
    try {
      const response = await fetch('/api/admin/pos-reports', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUploadedReports(data);
      } else {
        console.error('보고서 목록 로드 실패');
      }
    } catch (error) {
      console.error('보고서 목록 로드 오류:', error);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.tar')) {
      alert('TAR 파일만 업로드 가능합니다.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/pos-reports/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        setUploadedReports(prev => [result, ...prev]);
        alert('파일 업로드가 완료되었습니다.');
      } else {
        const error = await response.json();
        alert(`업로드 실패: ${error.error}`);
      }
    } catch (error) {
      console.error('업로드 오류:', error);
      alert('업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const viewReport = (reportId: string) => {
    window.location.href = `/admin/pos-reports/view/${reportId}`;
  };

  const deleteReport = async (reportId: string) => {
    if (!confirm('정말로 이 보고서를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/pos-reports/${reportId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setUploadedReports(prev => prev.filter(report => report.id !== reportId));
        alert('보고서가 삭제되었습니다.');
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            POS 보고서 관리
          </h1>
          <p className="text-gray-600">
            포스 기기의 TAR 파일을 업로드하여 보고서를 확인하고 엑셀로 다운로드할 수 있습니다.
          </p>
        </div>

        {/* 파일 업로드 영역 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            TAR 파일 업로드
          </h2>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="text-gray-400">
                <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isUploading ? '업로드 중...' : 'TAR 파일을 여기에 드래그하거나 클릭하여 선택하세요'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  itemamounts.csv 파일이 포함된 TAR 파일만 업로드 가능합니다
                </p>
              </div>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? '업로드 중...' : '파일 선택'}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".tar"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
            </div>
          </div>
        </div>

        {/* 업로드된 보고서 목록 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              업로드된 보고서 ({uploadedReports.length})
            </h2>
          </div>
          
          {uploadedReports.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>업로드된 보고서가 없습니다.</p>
              <p className="text-sm mt-1">위에서 TAR 파일을 업로드해주세요.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      파일명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      업로드 날짜
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      레코드 수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {uploadedReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {report.filename}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.uploadDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.recordCount.toLocaleString()}개
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => viewReport(report.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          보기
                        </button>
                        <button
                          onClick={() => deleteReport(report.id)}
                          className="ml-2 text-red-600 hover:text-red-900"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 