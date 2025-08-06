const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPosData() {
  try {
    const reports = await prisma.posReport.findMany({
      orderBy: { uploadDate: 'desc' },
      take: 1
    });

    if (reports.length === 0) {
      console.log('저장된 POS 보고서가 없습니다.');
      return;
    }

    const latestReport = reports[0];
    console.log('최신 보고서 정보:');
    console.log('- ID:', latestReport.id);
    console.log('- 파일명:', latestReport.filename);
    console.log('- 레코드 수:', latestReport.recordCount);
    console.log('- 업로드 날짜:', latestReport.uploadDate);

    const data = latestReport.data;
    console.log('\n데이터 샘플:');
    
    if (data && data.length > 0) {
      // 첫 번째 레코드의 모든 컬럼명 출력
      const firstRecord = data[0];
      console.log('첫 번째 레코드의 컬럼들:');
      Object.keys(firstRecord).forEach(key => {
        console.log(`- ${key}: ${firstRecord[key]}`);
      });

      // 파일별로 데이터 분리
      const fileGroups = {};
      data.forEach(record => {
        const sourceFile = record._sourceFile || 'unknown';
        if (!fileGroups[sourceFile]) {
          fileGroups[sourceFile] = [];
        }
        fileGroups[sourceFile].push(record);
      });

      console.log('\n파일별 데이터:');
      Object.keys(fileGroups).forEach(file => {
        const records = fileGroups[file];
        console.log(`\n${file} (${records.length}개 레코드):`);
        
        if (records.length > 0) {
          const sampleRecord = records[0];
          console.log('컬럼명들:');
          Object.keys(sampleRecord).forEach(key => {
            if (!key.startsWith('_')) {
              console.log(`  - ${key}: ${sampleRecord[key]}`);
            }
          });
        }
      });
    } else {
      console.log('데이터가 없습니다.');
    }

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPosData(); 