const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDuplicates() {
  console.log('=== 주의사항 중복 확인 ===');
  
  // 주의사항 중복 확인
  const precautions = await prisma.precaution.findMany({
    orderBy: { title: 'asc' }
  });
  
  const precautionTitles = precautions.map(p => p.title);
  const duplicatePrecautionTitles = precautionTitles.filter((title, index) => 
    precautionTitles.indexOf(title) !== index
  );
  
  console.log('중복된 주의사항 제목:', [...new Set(duplicatePrecautionTitles)]);
  
  if (duplicatePrecautionTitles.length > 0) {
    console.log('\n중복된 주의사항 상세:');
    for (const title of [...new Set(duplicatePrecautionTitles)]) {
      const duplicates = precautions.filter(p => p.title === title);
      console.log(`\n제목: "${title}"`);
      duplicates.forEach((p, index) => {
        console.log(`  ${index + 1}. ID: ${p.id}, 생성일: ${p.createdAt}, 내용: ${p.content.substring(0, 50)}...`);
      });
    }
  }
  
  console.log('\n=== 매뉴얼 중복 확인 ===');
  
  // 매뉴얼 중복 확인
  const manuals = await prisma.manual.findMany({
    orderBy: { title: 'asc' }
  });
  
  const manualTitles = manuals.map(m => m.title);
  const duplicateManualTitles = manualTitles.filter((title, index) => 
    manualTitles.indexOf(title) !== index
  );
  
  console.log('중복된 매뉴얼 제목:', [...new Set(duplicateManualTitles)]);
  
  if (duplicateManualTitles.length > 0) {
    console.log('\n중복된 매뉴얼 상세:');
    for (const title of [...new Set(duplicateManualTitles)]) {
      const duplicates = manuals.filter(m => m.title === title);
      console.log(`\n제목: "${title}"`);
      duplicates.forEach((m, index) => {
        console.log(`  ${index + 1}. ID: ${m.id}, 버전: ${m.version}, 생성일: ${m.createdAt}, 내용: ${m.content.substring(0, 50)}...`);
      });
    }
  }
  
  console.log('\n=== 체크리스트 연결 확인 ===');
  
  // 체크리스트에서 사용 중인 연결된 항목들 확인
  const checklistConnections = await prisma.checklistItemConnection.findMany({
    include: {
      item: true
    }
  });
  
  console.log('체크리스트 연결된 항목들:');
  checklistConnections.forEach(connection => {
    console.log(`- 연결 ID: ${connection.id}, 타입: ${connection.itemType}, 항목 ID: ${connection.itemId}`);
  });
  
  await prisma.$disconnect();
}

checkDuplicates().catch(console.error);
