const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCurrentEmployee() {
  try {
    console.log('=== 현재 직원 계정 확인 ===');
    
    // 모든 직원 조회
    const employees = await prisma.employee.findMany();
    
    console.log('현재 직원 목록:');
    employees.forEach((emp, index) => {
      console.log(`${index + 1}. ID: ${emp.id}`);
      console.log(`   이름: ${emp.name}`);
      console.log(`   사용자명: ${emp.username}`);
      console.log(`   이메일: ${emp.email}`);
      console.log(`   부서: ${emp.department}`);
      console.log(`   최고관리자: ${emp.isSuperAdmin}`);
      console.log(`   활성화: ${emp.isActive}`);
      console.log('   ---');
    });
    
    if (employees.length === 0) {
      console.log('직원이 없습니다.');
    }
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentEmployee();