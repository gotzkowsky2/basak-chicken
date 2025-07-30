const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdminAccount() {
  try {
    console.log('=== 기본 관리자 계정 생성 ===');
    
    // 관리자 계정 생성
    const admin = await prisma.admin.create({
      data: {
        username: 'admin',
        password: 'admin123', // 실제 운영시에는 더 강력한 비밀번호 사용
        email: 'admin@basak-chicken.com',
        name: '관리자'
      }
    });
    
    console.log('✓ 관리자 계정 생성 완료:', {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      name: admin.name
    });
    
    // 기본 직원 계정도 생성
    const employee = await prisma.employee.create({
      data: {
        username: 'employee',
        password: 'employee123',
        email: 'employee@basak-chicken.com',
        name: '직원',
        department: '일반',
        employeeId: 'EMP001',
        isActive: true
      }
    });
    
    console.log('✓ 직원 계정 생성 완료:', {
      id: employee.id,
      username: employee.username,
      email: employee.email,
      name: employee.name
    });
    
    console.log('\n=== 로그인 정보 ===');
    console.log('관리자: admin / admin123');
    console.log('직원: employee / employee123');
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminAccount();