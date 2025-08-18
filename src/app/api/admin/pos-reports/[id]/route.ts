import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'

export async function GET(
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

    // 보고서 조회
    const report = await prisma.posReport.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      return NextResponse.json({ 
        error: "보고서를 찾을 수 없습니다." 
      }, { status: 404 });
    }

    return NextResponse.json({
      id: report.id,
      filename: report.filename,
      originalFilename: report.originalFilename,
      recordCount: report.recordCount,
      uploadDate: report.uploadDate.toLocaleDateString('ko-KR'),
      uploadedBy: report.uploadedBy,
      data: report.data
    });

  } catch (error) {
    console.error('POS 보고서 조회 오류:', error);
    return NextResponse.json({ 
      error: "보고서 조회 중 오류가 발생했습니다." 
    }, { status: 500 });
  }
} 

export async function DELETE(
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

    // 보고서 삭제
    await prisma.posReport.delete({
      where: { id: reportId }
    });

    return NextResponse.json({ message: "보고서가 삭제되었습니다." });

  } catch (error) {
    console.error('POS 보고서 삭제 오류:', error);
    return NextResponse.json({ 
      error: "보고서 삭제 중 오류가 발생했습니다." 
    }, { status: 500 });
  }
} 