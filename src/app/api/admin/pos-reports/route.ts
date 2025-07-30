import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
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

    // 업로드된 보고서 목록 조회
    const reports = await prisma.posReport.findMany({
      orderBy: { uploadDate: 'desc' },
      select: {
        id: true,
        filename: true,
        originalFilename: true,
        recordCount: true,
        uploadDate: true,
        uploadedBy: true
      }
    });

    return NextResponse.json(reports.map(report => ({
      id: report.id,
      filename: report.originalFilename,
      uploadDate: report.uploadDate.toLocaleDateString('ko-KR'),
      recordCount: report.recordCount
    })));

  } catch (error) {
    console.error('POS 보고서 목록 조회 오류:', error);
    return NextResponse.json({ 
      error: "보고서 목록 조회 중 오류가 발생했습니다." 
    }, { status: 500 });
  }
} 