const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setSuperAdmin() {
  try {
    console.log('=== 최고관리자 설정 ===');
    
    // 특정 직원 ID (배재범)
    const employeeId = 'cmdotoqpa0001u2zor2m0kned';
    
    const updatedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: { isSuperAdmin: true }
    });
    
    console.log(`\n✓ ${updatedEmployee.name}을 최고관리자로 설정했습니다.`);
    console.log(`최고관리자 여부: ${updatedEmployee.isSuperAdmin}`);
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setSuperAdmin();