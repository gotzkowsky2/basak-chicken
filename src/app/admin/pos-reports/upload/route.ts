import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import Papa from 'papaparse';

const prisma = new PrismaClient();
const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
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

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    if (!file.name.endsWith('.tar')) {
      return NextResponse.json({ error: 'TAR 파일만 업로드 가능합니다.' }, { status: 400 });
    }

    // 파일을 바이트 배열로 변환
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 업로드 디렉토리 생성
    const uploadDir = join(process.cwd(), 'uploads', 'pos-reports');
    await mkdir(uploadDir, { recursive: true });

    // 고유한 파일명 생성
    const timestamp = Date.now();
    const tarFileName = `pos-report-${timestamp}.tar`;
    const tarFilePath = join(uploadDir, tarFileName);
    const extractDir = join(uploadDir, `extract-${timestamp}`);

    // TAR 파일 저장
    await writeFile(tarFilePath, buffer);

    // TAR 파일 추출
    await mkdir(extractDir, { recursive: true });
    await execAsync(`tar -xf "${tarFilePath}" -C "${extractDir}"`);

    // TAR 파일 안의 모든 파일 목록 확인
    const { stdout: fileList } = await execAsync(`tar -tf "${tarFilePath}"`);
    console.log('TAR 파일 내용:', fileList);

    // 모든 CSV 파일 찾기
    const csvFiles = fileList.split('\n').filter(file => 
      file.trim() && file.toLowerCase().endsWith('.csv')
    );
    
    console.log('발견된 CSV 파일들:', csvFiles);

    if (csvFiles.length === 0) {
      return NextResponse.json({ 
        error: '분석 가능한 CSV 파일을 찾을 수 없습니다.' 
      }, { status: 400 });
    }

    // 모든 CSV 파일을 읽어서 통합 데이터 생성
    const allRecords: any[] = [];
    const fileInfo: any = {};

    for (const csvFile of csvFiles) {
      try {
        const csvFilePath = join(extractDir, csvFile);
        const fileContent = await readFile(csvFilePath, 'utf-8');
        
        console.log(`${csvFile} 파일 내용 길이:`, fileContent.length);
        console.log(`${csvFile} 파일 첫 200자:`, fileContent.substring(0, 200));
        
        const parseResult = Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          delimiter: ';',
          quoteChar: '"'
        });

        console.log(`${csvFile} 파싱 결과:`, {
          errors: parseResult.errors,
          dataLength: parseResult.data.length,
          firstRow: parseResult.data[0]
        });

        if (parseResult.errors.length > 0) {
          console.error(`${csvFile} 파싱 오류:`, parseResult.errors);
          continue; // 오류가 있어도 다른 파일은 계속 처리
        }

        const records = parseResult.data as any[];
        
        // 세무사가 필요한 핵심 정보만 추출
        const extractedRecords = records.map(record => {
          const extracted: any = {
            _sourceFile: csvFile,
            _recordType: csvFile.replace('.csv', '')
          };

          // 날짜 정보 추출
          if (record.Z_ERSTELLUNG) extracted.date = record.Z_ERSTELLUNG;
          else if (record.DATE) extracted.date = record.DATE;
          else if (record.DATUM) extracted.date = record.DATUM;

          // Brutto 정보 추출
          if (record.PF_BRUTTO) extracted.brutto = record.PF_BRUTTO;
          else if (record.BRUTTO) extracted.brutto = record.BRUTTO;
          else if (record.GROSS) extracted.brutto = record.GROSS;

          // Netto 정보 추출
          if (record.PF_NETTO) extracted.netto = record.PF_NETTO;
          else if (record.NETTO) extracted.netto = record.NETTO;
          else if (record.NET) extracted.netto = record.NET;

          // 세금 정보 추출
          if (record.PF_UST) extracted.tax = record.PF_UST;
          else if (record.UST) extracted.tax = record.UST;
          else if (record.TAX) extracted.tax = record.TAX;
          else if (record.VAT) extracted.tax = record.VAT;

          // 영수증 ID 추출
          if (record.BON_ID) extracted.receiptId = record.BON_ID;
          else if (record.RECEIPT_ID) extracted.receiptId = record.RECEIPT_ID;
          else if (record.TRANSACTION_ID) extracted.receiptId = record.TRANSACTION_ID;

          // 결제 방법 추출 (현금/카드)
          if (record.PAYMENT_TYPE) extracted.paymentMethod = record.PAYMENT_TYPE;
          else if (record.ZAHLART) extracted.paymentMethod = record.ZAHLART;
          else if (record.PAYMENT) extracted.paymentMethod = record.PAYMENT;
          else if (record.METHOD) extracted.paymentMethod = record.METHOD;

          // 취소 여부 추출
          if (record.TYP) extracted.cancelled = record.TYP === 'CANCEL' || record.TYP === 'STORNO';
          else if (record.CANCELLED) extracted.cancelled = record.CANCELLED;
          else if (record.STORNO) extracted.cancelled = record.STORNO;

          // 추가 정보 (원본 데이터 보존)
          extracted.originalData = record;

          return extracted;
        });

        allRecords.push(...extractedRecords);
        
        fileInfo[csvFile] = {
          recordCount: records.length,
          extractedCount: extractedRecords.length,
          columns: Object.keys(records[0] || {}),
          sampleData: records[0]
        };

      } catch (error) {
        console.error(`${csvFile} 파일 처리 오류:`, error);
        continue; // 오류가 있어도 다른 파일은 계속 처리
      }
    }

    const totalRecordCount = allRecords.length;
    console.log('통합 결과:', {
      totalFiles: csvFiles.length,
      totalRecords: totalRecordCount,
      fileInfo: fileInfo
    });

    if (totalRecordCount === 0) {
      return NextResponse.json({ 
        error: '모든 CSV 파일에서 데이터를 추출할 수 없습니다.' 
      }, { status: 400 });
    }

    // 데이터베이스에 보고서 정보 저장
    const report = await prisma.posReport.create({
      data: {
        filename: file.name,
        originalFilename: file.name,
        recordCount: totalRecordCount,
        uploadDate: new Date(),
        uploadedBy: employee.name,
        data: allRecords // JSON으로 저장
      }
    });

    return NextResponse.json({
      id: report.id,
      filename: file.name,
      uploadDate: report.uploadDate.toLocaleDateString('ko-KR'),
      recordCount: totalRecordCount
    });

  } catch (error) {
    console.error('POS 보고서 업로드 오류:', error);
    return NextResponse.json({ 
      error: '파일 업로드 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
} 