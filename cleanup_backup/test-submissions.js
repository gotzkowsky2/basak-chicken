const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSubmissions() {
  try {
    console.log('=== 제출내역 API 테스트 ===');
    
    // 1. 전체 체크리스트 인스턴스 수 확인
    const totalInstances = await prisma.checklistInstance.count();
    console.log(`전체 체크리스트 인스턴스 수: ${totalInstances}`);
    
    // 2. 최근 5개 인스턴스 조회
    const recentInstances = await prisma.checklistInstance.findMany({
      take: 5,
      include: {
        employee: {
          select: { id: true, name: true }
        },
        template: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('\n최근 5개 인스턴스:');
    recentInstances.forEach((instance, index) => {
      console.log(`${index + 1}. ID: ${instance.id}`);
      console.log(`   직원: ${instance.employee?.name} (${instance.employeeId})`);
      console.log(`   템플릿: ${instance.template?.name} (${instance.templateId})`);
      console.log(`   날짜: ${instance.date}`);
      console.log(`   완료: ${instance.isCompleted}`);
      console.log(`   제출: ${instance.isSubmitted}`);
      console.log('');
    });
    
    // 3. 배재범 직원의 인스턴스 확인
    const employee = await prisma.employee.findFirst({
      where: { name: '배재범' },
      select: { id: true, name: true }
    });
    
    if (employee) {
      console.log(`\n배재범 직원 정보: ${employee.name} (${employee.id})`);
      
      const employeeInstances = await prisma.checklistInstance.findMany({
        where: { employeeId: employee.id },
        include: {
          template: { select: { name: true } },
          checklistItemProgresses: true,
          connectedItemsProgress: true
        },
        orderBy: { date: 'desc' }
      });
      
      console.log(`배재범 직원의 체크리스트 인스턴스 수: ${employeeInstances.length}`);
      
      if (employeeInstances.length > 0) {
        console.log('\n배재범 직원의 최근 인스턴스:');
        employeeInstances.slice(0, 3).forEach((instance, index) => {
          console.log(`${index + 1}. ${instance.template.name} - ${instance.date}`);
          console.log(`   메인 항목: ${instance.checklistItemProgresses.length}개`);
          console.log(`   연결 항목: ${instance.connectedItemsProgress.length}개`);
          console.log(`   완료: ${instance.isCompleted}, 제출: ${instance.isSubmitted}`);
        });
      }
    }
    
  } catch (error) {
    console.error('테스트 중 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSubmissions(); 