const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixEmployeeName() {
  try {
    console.log('데이터베이스에서 "현재 직원" 데이터를 찾는 중...');
    
    // ChecklistInstance 테이블에서 "현재 직원"으로 되어있는 데이터 찾기
    const checklistInstances = await prisma.checklistInstance.findMany({
      where: {
        OR: [
          { completedBy: '현재 직원' },
          { notes: { contains: '현재 직원' } }
        ]
      }
    });
    
    console.log(`ChecklistInstance에서 찾은 데이터: ${checklistInstances.length}개`);
    
    // InventoryCheck 테이블에서 "현재 직원"으로 되어있는 데이터 찾기
    const inventoryChecks = await prisma.inventoryCheck.findMany({
      where: {
        checkedBy: '현재 직원'
      }
    });
    
    console.log(`InventoryCheck에서 찾은 데이터: ${inventoryChecks.length}개`);
    
    // Employee 테이블에서 "현재 직원"으로 되어있는 데이터 찾기
    const employees = await prisma.employee.findMany({
      where: {
        OR: [
          { name: '현재 직원' },
          { email: { contains: '현재 직원' } }
        ]
      }
    });
    
    console.log(`Employee에서 찾은 데이터: ${employees.length}개`);
    
    // 수정 작업 시작
    console.log('\n=== 수정 작업 시작 ===');
    
    // ChecklistInstance 수정
    if (checklistInstances.length > 0) {
      console.log('ChecklistInstance 데이터 수정 중...');
      for (const instance of checklistInstances) {
        await prisma.checklistInstance.update({
          where: { id: instance.id },
          data: {
            completedBy: instance.completedBy === '현재 직원' ? '배재범' : instance.completedBy,
            notes: instance.notes ? instance.notes.replace(/현재 직원/g, '배재범') : instance.notes
          }
        });
        console.log(`ChecklistInstance ID ${instance.id} 수정 완료`);
      }
    }
    
    // InventoryCheck 수정
    if (inventoryChecks.length > 0) {
      console.log('InventoryCheck 데이터 수정 중...');
      for (const check of inventoryChecks) {
        await prisma.inventoryCheck.update({
          where: { id: check.id },
          data: {
            checkedBy: '배재범'
          }
        });
        console.log(`InventoryCheck ID ${check.id} 수정 완료`);
      }
    }
    
    // Employee 수정 (만약 있다면)
    if (employees.length > 0) {
      console.log('Employee 데이터 수정 중...');
      for (const employee of employees) {
        await prisma.employee.update({
          where: { id: employee.id },
          data: {
            name: employee.name === '현재 직원' ? '배재범' : employee.name,
            email: employee.email ? employee.email.replace(/현재 직원/g, '배재범') : employee.email
          }
        });
        console.log(`Employee ID ${employee.id} 수정 완료`);
      }
    }
    
    console.log('\n=== 수정 작업 완료 ===');
    
    // 수정 후 확인
    console.log('\n=== 수정 후 확인 ===');
    
    const updatedChecklistInstances = await prisma.checklistInstance.findMany({
      where: {
        OR: [
          { completedBy: '현재 직원' },
          { notes: { contains: '현재 직원' } }
        ]
      }
    });
    
    const updatedInventoryChecks = await prisma.inventoryCheck.findMany({
      where: {
        checkedBy: '현재 직원'
      }
    });
    
    const updatedEmployees = await prisma.employee.findMany({
      where: {
        OR: [
          { name: '현재 직원' },
          { email: { contains: '현재 직원' } }
        ]
      }
    });
    
    console.log(`수정 후 "현재 직원" 데이터: ChecklistInstance ${updatedChecklistInstances.length}개, InventoryCheck ${updatedInventoryChecks.length}개, Employee ${updatedEmployees.length}개`);
    
    // "배재범" 데이터 확인
    const 배재범ChecklistInstances = await prisma.checklistInstance.findMany({
      where: {
        OR: [
          { completedBy: '배재범' },
          { notes: { contains: '배재범' } }
        ]
      }
    });
    
    const 배재범InventoryChecks = await prisma.inventoryCheck.findMany({
      where: {
        checkedBy: '배재범'
      }
    });
    
    const 배재범Employees = await prisma.employee.findMany({
      where: {
        OR: [
          { name: '배재범' },
          { email: { contains: '배재범' } }
        ]
      }
    });
    
    console.log(`"배재범" 데이터: ChecklistInstance ${배재범ChecklistInstances.length}개, InventoryCheck ${배재범InventoryChecks.length}개, Employee ${배재범Employees.length}개`);
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixEmployeeName(); 