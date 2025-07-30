"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface PosReportData {
  id: string;
  filename: string;
  originalFilename: string;
  recordCount: number;
  uploadDate: string;
  uploadedBy: string;
  data: any[];
}

interface FileInfo {
  name: string;
  germanName: string;
  description: string;
  recordCount: number;
  data: any[];
  columns: string[];
}

export default function PosReportViewPage() {
  const params = useParams();
  const reportId = params?.id as string;
  
  const [report, setReport] = useState<PosReportData | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fileInfos, setFileInfos] = useState<FileInfo[]>([]);

  // 독일어 파일명과 설명 매핑
  const getGermanFileInfo = (fileName: string): { name: string; description: string } => {
    const name = fileName.toLowerCase();
    
    if (name.includes('transactions.csv')) {
      return {
        name: 'Transaktionen',
        description: 'Geschäftsvorgänge und Zahlungsinformationen'
      };
    }
    if (name.includes('transactions_tse.csv')) {
      return {
        name: 'Transaktionen TSE',
        description: 'TSE-gesicherte Geschäftsvorgänge'
      };
    }
    if (name.includes('transactions_vat.csv')) {
      return {
        name: 'Transaktionen UST',
        description: 'Umsatzsteuer-relevante Transaktionen'
      };
    }
    if (name.includes('tse.csv')) {
      return {
        name: 'TSE Berichte',
        description: 'Technische Sicherheitseinrichtung Daten'
      };
    }
    if (name.includes('vat.csv')) {
      return {
        name: 'UST Berichte',
        description: 'Umsatzsteuer Informationen'
      };
    }
    if (name.includes('lines.csv')) {
      return {
        name: 'Zeilen-Daten',
        description: 'Einzelne Artikel und Produktdetails'
      };
    }
    if (name.includes('lines_vat.csv')) {
      return {
        name: 'Zeilen-UST',
        description: 'Artikel-spezifische Steuerdaten'
      };
    }
    if (name.includes('itemamounts.csv')) {
      return {
        name: 'Artikel-Mengen',
        description: 'Artikel-Mengen und Preisdaten'
      };
    }
    if (name.includes('payments.csv')) {
      return {
        name: 'Zahlungen',
        description: 'Zahlungsmethoden und -details'
      };
    }
    if (name.includes('receipts.csv')) {
      return {
        name: 'Belege',
        description: 'Kassenbelege und Rechnungen'
      };
    }
    if (name.includes('products.csv')) {
      return {
        name: 'Produkte',
        description: 'Produktkatalog und Preise'
      };
    }
    if (name.includes('categories.csv')) {
      return {
        name: 'Kategorien',
        description: 'Produktkategorien und -gruppen'
      };
    }
    if (name.includes('employees.csv')) {
      return {
        name: 'Mitarbeiter',
        description: 'Mitarbeiterdaten und Arbeitszeiten'
      };
    }
    if (name.includes('shifts.csv')) {
      return {
        name: 'Schichten',
        description: 'Arbeitsschichten und -zeiten'
      };
    }
    if (name.includes('inventory.csv')) {
      return {
        name: 'Inventar',
        description: 'Lagerbestand und -bewegungen'
      };
    }
    if (name.includes('suppliers.csv')) {
      return {
        name: 'Lieferanten',
        description: 'Lieferantendaten und -beziehungen'
      };
    }
    if (name.includes('customers.csv')) {
      return {
        name: 'Kunden',
        description: 'Kundendaten und -historie'
      };
    }
    if (name.includes('discounts.csv')) {
      return {
        name: 'Rabatte',
        description: 'Rabatt- und Sonderangebote'
      };
    }
    if (name.includes('taxes.csv')) {
      return {
        name: 'Steuern',
        description: 'Steuersätze und -regelungen'
      };
    }
    if (name.includes('settings.csv')) {
      return {
        name: 'Einstellungen',
        description: 'System- und Geräteeinstellungen'
      };
    }
    if (name.includes('logs.csv')) {
      return {
        name: 'Protokolle',
        description: 'Systemprotokolle und -ereignisse'
      };
    }
    if (name.includes('errors.csv')) {
      return {
        name: 'Fehler',
        description: 'Fehlerprotokolle und -meldungen'
      };
    }
    if (name.includes('backup.csv')) {
      return {
        name: 'Backup',
        description: 'Backup- und Sicherungsdaten'
      };
    }
    if (name.includes('config.csv')) {
      return {
        name: 'Konfiguration',
        description: 'Systemkonfiguration und -parameter'
      };
    }
    
    return {
      name: fileName.replace('.csv', ''),
      description: 'Weitere Geschäftsdaten'
    };
  };

  // 컬럼명을 독일어로 변환하는 함수
  const getGermanColumnName = (columnName: string): string => {
    const name = columnName.toLowerCase();
    
    // 날짜 관련
    if (name.includes('date') || name.includes('datum')) return 'Datum';
    if (name.includes('time') || name.includes('zeit')) return 'Zeit';
    if (name.includes('timestamp')) return 'Zeitstempel';
    
    // 금액 관련
    if (name.includes('amount') || name.includes('betrag')) return 'Betrag';
    if (name.includes('price') || name.includes('preis')) return 'Preis';
    if (name.includes('total') || name.includes('gesamt')) return 'Gesamt';
    if (name.includes('netto') || name.includes('net')) return 'Netto';
    if (name.includes('brutto') || name.includes('gross')) return 'Brutto';
    if (name.includes('tax') || name.includes('steuer') || name.includes('ust')) return 'Steuer';
    if (name.includes('vat')) return 'UST';
    
    // ID 관련
    if (name.includes('id') || name.includes('nummer')) return 'ID';
    if (name.includes('receipt') || name.includes('beleg')) return 'Beleg-ID';
    if (name.includes('transaction') || name.includes('transaktion')) return 'Transaktions-ID';
    if (name.includes('order') || name.includes('bestellung')) return 'Bestell-ID';
    if (name.includes('customer') || name.includes('kunde')) return 'Kunden-ID';
    if (name.includes('employee') || name.includes('mitarbeiter')) return 'Mitarbeiter-ID';
    if (name.includes('product') || name.includes('produkt')) return 'Produkt-ID';
    
    // 상태 관련
    if (name.includes('status')) return 'Status';
    if (name.includes('cancelled') || name.includes('storniert')) return 'Storniert';
    if (name.includes('active') || name.includes('aktiv')) return 'Aktiv';
    if (name.includes('deleted') || name.includes('gelöscht')) return 'Gelöscht';
    
    // 결제 관련
    if (name.includes('payment') || name.includes('zahlung')) return 'Zahlungsart';
    if (name.includes('cash') || name.includes('bargeld')) return 'Bargeld';
    if (name.includes('card') || name.includes('karte')) return 'Karte';
    if (name.includes('credit') || name.includes('kredit')) return 'Kreditkarte';
    if (name.includes('debit') || name.includes('ec')) return 'EC-Karte';
    
    // 제품 관련
    if (name.includes('product') || name.includes('produkt')) return 'Produkt';
    if (name.includes('item') || name.includes('artikel')) return 'Artikel';
    if (name.includes('category') || name.includes('kategorie')) return 'Kategorie';
    if (name.includes('quantity') || name.includes('menge')) return 'Menge';
    if (name.includes('unit') || name.includes('einheit')) return 'Einheit';
    
    // 기타
    if (name.includes('description') || name.includes('beschreibung')) return 'Beschreibung';
    if (name.includes('name') || name.includes('name')) return 'Name';
    if (name.includes('type') || name.includes('typ')) return 'Typ';
    if (name.includes('code') || name.includes('code')) return 'Code';
    if (name.includes('note') || name.includes('notiz')) return 'Notiz';
    if (name.includes('comment') || name.includes('kommentar')) return 'Kommentar';
    
    // 원본 컬럼명 반환 (첫 글자만 대문자로)
    return columnName.charAt(0).toUpperCase() + columnName.slice(1);
  };

  // 파일별 데이터 분리
  const getFileData = (fileName: string) => {
    if (!report) return [];
    return report.data.filter(item => item._sourceFile === fileName);
  };

  // 모든 파일 목록 가져오기
  const getAllFiles = () => {
    if (!report) return [];
    const files = [...new Set(report.data.map(item => item._sourceFile))];
    return files.sort();
  };

  useEffect(() => {
    if (reportId) {
      loadReport();
    }
  }, [reportId]);

  useEffect(() => {
    if (report) {
      const files = getAllFiles();
      const infos: FileInfo[] = files.map(file => {
        const fileData = getFileData(file);
        const germanInfo = getGermanFileInfo(file);
        return {
          name: file,
          germanName: germanInfo.name,
          description: germanInfo.description,
          recordCount: fileData.length,
          data: fileData,
          columns: fileData.length > 0 ? Object.keys(fileData[0]).filter(key => !key.startsWith('_')) : []
        };
      });
      setFileInfos(infos);
      setIsLoading(false);
    }
  }, [report]);

  const loadReport = async () => {
    try {
      const response = await fetch(`/api/admin/pos-reports/${reportId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setReport(data);
      } else {
        alert('보고서를 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('보고서 로드 오류:', error);
      alert('보고서 로드 중 오류가 발생했습니다.');
    }
  };

  const downloadExcel = async () => {
    if (!selectedFile) {
      alert('다운로드할 파일을 선택해주세요.');
      return;
    }

    try {
      const response = await fetch(`/api/admin/pos-reports/${reportId}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: {},
          selectedFile: selectedFile
        }),
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedFile.replace('.csv', '')}_report.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('엑셀 다운로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('엑셀 다운로드 오류:', error);
      alert('엑셀 다운로드 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">보고서를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">보고서를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const selectedFileData = selectedFile ? fileInfos.find(f => f.name === selectedFile) : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                POS Berichte (POS 보고서)
              </h1>
              <p className="text-gray-600">
                {report.originalFilename} - {report.recordCount.toLocaleString()} Datensätze
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.href = '/admin/pos-reports'}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Zurück zur Liste
              </button>
              {selectedFile && (
                <button
                  onClick={downloadExcel}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Excel herunterladen
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 보고서 정보 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Dateiname</p>
              <p className="text-sm text-gray-900">{report.originalFilename}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Upload Datum</p>
              <p className="text-sm text-gray-900">{report.uploadDate}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Hochgeladen von</p>
              <p className="text-sm text-gray-900">{report.uploadedBy}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Gesamt Datensätze</p>
              <p className="text-sm text-gray-900">{report.recordCount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 파일 목록 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Verfügbare Berichte
                </h2>
              </div>
              <div className="p-4">
                {fileInfos.map((fileInfo) => (
                  <button
                    key={fileInfo.name}
                    onClick={() => setSelectedFile(fileInfo.name)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors mb-3 ${
                      selectedFile === fileInfo.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                                         <div className="font-medium text-gray-900">
                       {fileInfo.germanName}
                     </div>
                     <div className="text-sm text-gray-600 mt-1">
                       {fileInfo.description}
                     </div>
                     <div className="text-sm text-gray-500 mt-1">
                       {fileInfo.recordCount.toLocaleString()} Datensätze
                     </div>
                     <div className="text-xs text-gray-400 mt-1">
                       {fileInfo.name}
                     </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 선택된 파일 데이터 */}
          <div className="lg:col-span-2">
            {selectedFileData ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedFileData.germanName} - {selectedFileData.recordCount.toLocaleString()} Datensätze
                  </h2>
                </div>
                                 <div className="overflow-x-auto">
                   <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50">
                       <tr>
                         {selectedFileData.columns.map((column, index) => (
                           <th key={index} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             {getGermanColumnName(column)}
                           </th>
                         ))}
                       </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                       {selectedFileData.data.slice(0, 50).map((row, rowIndex) => (
                         <tr key={rowIndex} className="hover:bg-gray-50">
                           {selectedFileData.columns.map((column, colIndex) => (
                             <td key={colIndex} className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                               {(() => {
                                 const value = row[column];
                                 if (value === null || value === undefined || value === '') {
                                   return '-';
                                 }
                                 
                                 // 숫자인 경우 소수점 2자리로 포맷
                                 if (typeof value === 'number' || !isNaN(parseFloat(value))) {
                                   return parseFloat(value).toFixed(2);
                                 }
                                 
                                 // 날짜/시간인 경우 적절히 표시
                                 if (typeof value === 'string') {
                                   // Z_ERSTELLUNG 컬럼 특별 처리 (독일어 날짜 형식)
                                   if (column.toLowerCase().includes('erstellung') || column.toLowerCase().includes('datum')) {
                                     // 다양한 날짜 형식 처리
                                     let dateValue = value;
                                     
                                     // 독일어 날짜 형식 (DD.MM.YYYY HH:MM:SS)
                                     if (value.match(/^\d{2}\.\d{2}\.\d{4}/)) {
                                       const parts = value.split(' ');
                                       const datePart = parts[0];
                                       const timePart = parts[1] || '';
                                       
                                       const [day, month, year] = datePart.split('.');
                                       const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                                       
                                       if (!isNaN(date.getTime())) {
                                         if (timePart) {
                                           return `${date.toLocaleDateString('de-DE')} ${timePart}`;
                                         } else {
                                           return date.toLocaleDateString('de-DE');
                                         }
                                       }
                                     }
                                     
                                     // ISO 날짜 형식 (2023-12-25T14:30:00Z)인 경우
                                     if (value.includes('T')) {
                                       const date = new Date(value);
                                       if (!isNaN(date.getTime())) {
                                         return date.toLocaleString('de-DE', {
                                           year: 'numeric',
                                           month: '2-digit',
                                           day: '2-digit',
                                           hour: '2-digit',
                                           minute: '2-digit',
                                           second: '2-digit'
                                         });
                                       }
                                     }
                                     
                                     // 일반 날짜 형식 (2023-12-25)인 경우
                                     if (value.includes('-') && value.length === 10) {
                                       const date = new Date(value);
                                       if (!isNaN(date.getTime())) {
                                         return date.toLocaleDateString('de-DE');
                                       }
                                     }
                                     
                                     // 숫자로 된 타임스탬프인 경우
                                     if (!isNaN(parseFloat(value)) && value.length > 10) {
                                       const timestamp = parseFloat(value);
                                       const date = new Date(timestamp);
                                       if (!isNaN(date.getTime())) {
                                         return date.toLocaleString('de-DE', {
                                           year: 'numeric',
                                           month: '2-digit',
                                           day: '2-digit',
                                           hour: '2-digit',
                                           minute: '2-digit',
                                           second: '2-digit'
                                         });
                                       }
                                     }
                                   }
                                   
                                   // 일반적인 날짜/시간 처리
                                   if (value.includes('-')) {
                                     // ISO 날짜 형식 (2023-12-25T14:30:00Z)인 경우
                                     if (value.includes('T')) {
                                       const date = new Date(value);
                                       if (!isNaN(date.getTime())) {
                                         return date.toLocaleString('de-DE', {
                                           year: 'numeric',
                                           month: '2-digit',
                                           day: '2-digit',
                                           hour: '2-digit',
                                           minute: '2-digit',
                                           second: '2-digit'
                                         });
                                       }
                                     }
                                     // 일반 날짜 형식 (2023-12-25)인 경우
                                     if (value.length === 10) {
                                       const date = new Date(value);
                                       if (!isNaN(date.getTime())) {
                                         return date.toLocaleDateString('de-DE');
                                       }
                                     }
                                     // 다른 날짜 형식은 그대로 표시
                                     return value;
                                   }
                                 }
                                 
                                 // 긴 텍스트는 잘라서 표시
                                 if (typeof value === 'string' && value.length > 20) {
                                   return value.substring(0, 20) + '...';
                                 }
                                 
                                 return value.toString();
                               })()}
                             </td>
                           ))}
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
                {selectedFileData.data.length > 50 && (
                  <div className="px-6 py-4 border-t border-gray-200 text-center text-sm text-gray-500">
                    Zeige 50 von {selectedFileData.data.length} Datensätzen
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-600">
                  Wählen Sie einen Bericht aus der linken Liste aus, um die Daten anzuzeigen.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 