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

    // TAR 파일 안의 파일 목록 확인 (추출 전 검증)
    const { stdout: fileListRaw } = await execAsync(`tar -tf "${tarFilePath}"`);
    const fileList = fileListRaw.split('\n').filter(Boolean);
    if (process.env.NODE_ENV !== 'production') {
      console.log('TAR 파일 내용(미리보기):', fileList.slice(0, 20));
    }

    // 경로 안전성 검증: 절대경로/경로 역참조/드라이브 레터/백슬래시 금지
    const isUnsafePath = (p: string) => {
      return (
        p.startsWith('/') ||
        p.includes('..') ||
        p.includes('\\') ||
        /^[A-Za-z]:/.test(p) ||
        p.startsWith('-')
      );
    };

    for (const entry of fileList) {
      if (isUnsafePath(entry)) {
        return NextResponse.json({ error: '압축 파일에 허용되지 않는 경로가 포함되어 있습니다.' }, { status: 400 });
      }
    }

    // CSV 파일만 허용 + 최대 파일 수 제한
    const allCsvFiles = fileList.filter((p) => p.toLowerCase().endsWith('.csv'));
    const MAX_FILES = 50;
    if (allCsvFiles.length === 0) {
      return NextResponse.json({ error: 'CSV 파일을 찾을 수 없습니다.' }, { status: 400 });
    }
    if (allCsvFiles.length > MAX_FILES) {
      return NextResponse.json({ error: `CSV 파일이 너무 많습니다. 최대 ${MAX_FILES}개까지 허용됩니다.` }, { status: 400 });
    }

    // 안전한 경로만 지정 추출
    await mkdir(extractDir, { recursive: true });
    const quotedCsv = allCsvFiles.map((p) => `'${p.replace(/'/g, "'\\''")}'`).join(' ');
    await execAsync(`tar -xf "${tarFilePath}" -C "${extractDir}" -- ${quotedCsv}`);

    const csvFiles = allCsvFiles;
    if (process.env.NODE_ENV !== 'production') {
      console.log('처리할 CSV 파일들:', csvFiles);
    }
    
    // CSV 파일이 없으면 에러
    if (csvFiles.length === 0) {
      return NextResponse.json({ 
        error: 'CSV 파일을 찾을 수 없습니다.' 
      }, { status: 400 });
    }
    
    if (csvFiles.length === 0) {
      return NextResponse.json({ error: '분석 가능한 CSV 파일을 찾을 수 없습니다.' }, { status: 400 });
    }

    // 모든 CSV 파일을 읽어서 통합 데이터 생성
    const allRecords: any[] = [];
    const fileInfo: any = {};

    for (const csvFile of csvFiles) {
      try {
        const csvFilePath = join(extractDir, csvFile);
        const fileContent = await readFile(csvFilePath, 'utf-8');
        if (process.env.NODE_ENV !== 'production') {
          console.log(`${csvFile} 파일 내용 길이:`, fileContent.length);
          console.log(`${csvFile} 샘플(첫 200자):`, fileContent.substring(0, 200));
        }
        
        // 먼저 세미콜론으로 파싱 시도
        let parseResult = Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          delimiter: ';',
          quoteChar: '"'
        });

        // 세미콜론으로 파싱이 실패하거나 데이터가 없으면 콤마로 시도
        if (parseResult.errors.length > 0 || parseResult.data.length === 0 || Object.keys(parseResult.data[0] || {}).length === 0) {
          console.log(`${csvFile} 세미콜론 파싱 실패, 콤마로 재시도...`);
          parseResult = Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
            delimiter: ',',
            quoteChar: '"'
          });
        }

        console.log(`${csvFile} 파싱 결과:`, {
          errors: parseResult.errors,
          dataLength: parseResult.data.length,
          firstRow: parseResult.data[0],
          allColumns: Object.keys(parseResult.data[0] || {}),
          sampleData: parseResult.data[0]
        });

        // 실제 컬럼명들 출력
        if (process.env.NODE_ENV !== 'production') {
          if (parseResult.data.length > 0 && parseResult.data[0]) {
            console.log(`${csvFile} 실제 컬럼명들:`, Object.keys(parseResult.data[0] as any));
            console.log(`${csvFile} 첫 번째 데이터:`, parseResult.data[0]);
            console.log(`${csvFile} 전체 데이터 수:`, parseResult.data.length);
          }
        }

        if (parseResult.errors.length > 0) {
          console.error(`${csvFile} 파싱 오류:`, parseResult.errors);
          continue; // 오류가 있어도 다른 파일은 계속 처리
        }

        const records = parseResult.data as any[];
        
        // 원본 데이터 그대로 보존 (파일 정보만 추가)
        const extractedRecords = records.map(record => {
          return {
            ...record, // 원본 데이터 그대로 보존
            _sourceFile: csvFile,
            _recordType: csvFile.replace('.csv', '')
          };
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
    if (process.env.NODE_ENV !== 'production') {
      console.log('통합 결과:', {
        totalFiles: csvFiles.length,
        totalRecords: totalRecordCount,
        fileInfo: fileInfo
      });
    }

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