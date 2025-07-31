const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('=== 데이터베이스 상태 확인 ===\n');

    // ChecklistInstance 확인
    const instances = await prisma.checklistInstance.findMany({
      include: {
        employee: true,
        template: true,
        connectedItemsProgress: true
      }
    });

    console.log('📋 ChecklistInstance 개수:', instances.length);
    instances.forEach(p => {
      console.log(`- ID: ${p.id}`);
      console.log(`  직원: ${p.employee?.name || 'Unknown'}`);
      console.log(`  템플릿: ${p.template?.content || 'Unknown'}`);
      console.log(`  날짜: ${p.date.toISOString()}`);
      console.log(`  완료: ${p.isCompleted}`);
      console.log(`  제출: ${p.isSubmitted}`);
      console.log(`  연결된 항목: ${p.connectedItemsProgress?.length || 0}개`);
      console.log('');
    });

    // TimeSlotChecklistStatus 확인
    const timeSlotStatus = await prisma.timeSlotChecklistStatus.findMany({
      include: {
        employee: true
      }
    });

    console.log('🔒 TimeSlotChecklistStatus 개수:', timeSlotStatus.length);
    timeSlotStatus.forEach(ts => {
      console.log(`- 위치: ${ts.workplace}, 시간대: ${ts.timeSlot}`);
      console.log(`  날짜: ${ts.date.toISOString()}`);
      console.log(`  잠금: ${ts.isLocked}`);
      if (ts.lockedBy) {
        console.log(`  잠금자: ${ts.employee?.name || 'Unknown'}`);
        console.log(`  잠금시간: ${ts.lockedAt?.toISOString()}`);
      }
      console.log('');
    });

    // Employee 확인
    const employees = await prisma.employee.findMany();
    console.log('👥 Employee 개수:', employees.length);
    employees.forEach(emp => {
      console.log(`- ${emp.name} (${emp.id})`);
    });

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase(); 