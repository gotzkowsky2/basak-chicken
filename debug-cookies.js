const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugCookies() {
  try {
    console.log('=== 쿠키 디버깅 ===\n');

    // 모든 직원 확인
    const employees = await prisma.employee.findMany();
    console.log('👥 직원 목록:');
    employees.forEach(emp => {
      console.log(`- ID: ${emp.id}`);
      console.log(`  직원ID: ${emp.employeeId}`);
      console.log(`  이름: ${emp.name}`);
      console.log(`  활성: ${emp.isActive}`);
      console.log('');
    });

    // 모든 관리자 확인
    const admins = await prisma.admin.findMany();
    console.log('👑 관리자 목록:');
    admins.forEach(admin => {
      console.log(`- ID: ${admin.id}`);
      console.log(`  사용자명: ${admin.username}`);
      console.log(`  이름: ${admin.name}`);
      console.log(`  이메일: ${admin.email}`);
      console.log('');
    });

    // 체크리스트 인스턴스 확인
    const instances = await prisma.checklistInstance.findMany({
      include: {
        employee: true,
        template: true
      }
    });
    console.log('📋 체크리스트 인스턴스:');
    instances.forEach(instance => {
      console.log(`- ID: ${instance.id}`);
      console.log(`  직원: ${instance.employee?.name || 'Unknown'}`);
      console.log(`  템플릿: ${instance.template?.content || 'Unknown'}`);
      console.log(`  날짜: ${instance.date.toISOString()}`);
      console.log(`  완료: ${instance.isCompleted}`);
      console.log('');
    });

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugCookies(); 