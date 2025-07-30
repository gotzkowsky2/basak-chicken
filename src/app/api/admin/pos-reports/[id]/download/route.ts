import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 관리자 인증 확인
    const adminAuth = req.cookies.get("admin_auth")?.value;
    const employeeAuth = req.cookies.get("employee_auth")?.value;
    
    if (!adminAuth && !employeeAuth) {
      return NextResponse.json({ 
        error: "관리자 인증이 필요합니다." 
      }, { status: 401 });
    }

    const authId = adminAuth || employeeAuth;
    const employee = await prisma.employee.findUnique({ 
      where: { id: authId },
      select: { name: true, isSuperAdmin: true }
    });

    if (!employee || !employee.isSuperAdmin) {
      return NextResponse.json({ 
        error: "관리자 권한이 필요합니다." 
      }, { status: 403 });
    }

    const { id: reportId } = await params;
    const { filters } = await req.json();

    // 보고서 조회
    const report = await prisma.posReport.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      return NextResponse.json({ 
        error: "보고서를 찾을 수 없습니다." 
      }, { status: 404 });
    }

    // 필터링 적용
    let data = report.data as any[];

    if (filters) {
      // 날짜 필터
      if (filters.date) {
        data = data.filter(item => 
          item.date && item.date.includes(filters.date)
        );
      }

      // 영수증 번호 필터
      if (filters.receiptNumber) {
        data = data.filter(item => 
          item.receiptNumber && item.receiptNumber.includes(filters.receiptNumber)
        );
      }

      // 세율 필터
      if (filters.taxRate) {
        data = data.filter(item => 
          item.taxRate && item.taxRate.toString().includes(filters.taxRate)
        );
      }

      // 검색어 필터
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        data = data.filter(item => 
          Object.values(item).some(value => 
            value && value.toString().toLowerCase().includes(term)
          )
        );
      }
    }

    // 엑셀 워크북 생성
    const workbook = XLSX.utils.book_new();
    
    // 워크시트 생성
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 컬럼 너비 자동 조정
    const columnWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    worksheet['!cols'] = columnWidths;

    // 워크시트를 워크북에 추가
    XLSX.utils.book_append_sheet(workbook, worksheet, 'POS_Report');

    // 엑셀 파일 생성
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    });

    // 응답 헤더 설정
    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', `attachment; filename="${report.originalFilename.replace('.tar', '')}_filtered.xlsx"`);

    return new NextResponse(excelBuffer, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('POS 보고서 엑셀 다운로드 오류:', error);
    return NextResponse.json({ 
      error: "엑셀 다운로드 중 오류가 발생했습니다." 
    }, { status: 500 });
  }
} 