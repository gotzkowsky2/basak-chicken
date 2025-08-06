const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateData() {
  try {
    console.log('데이터 마이그레이션을 시작합니다...');

    // 1. 기존 ChecklistSubmission 데이터 조회
    const submissions = await prisma.checklistSubmission.findMany({
      include: {
        template: true,
        employee: true,
        itemResponses: true
      }
    });

    console.log(`총 ${submissions.length}개의 체크리스트 제출 데이터를 발견했습니다.`);

    // 2. 각 제출 데이터를 ChecklistInstance로 변환
    for (const submission of submissions) {
      console.log(`마이그레이션 중: ${submission.id}`);

      // 기존 인스턴스가 있는지 확인
      const existingInstance = await prisma.checklistInstance.findUnique({
        where: {
          workplace_timeSlot_date: {
            workplace: submission.workplace,
            timeSlot: submission.timeSlot,
            date: submission.submissionDate
          }
        }
      });

      if (existingInstance) {
        console.log(`이미 존재하는 인스턴스: ${existingInstance.id}`);
        continue;
      }

      // 새로운 ChecklistInstance 생성
      const newInstance = await prisma.checklistInstance.create({
        data: {
          employeeId: submission.employeeId,
          templateId: submission.templateId,
          date: submission.submissionDate,
          workplace: submission.workplace,
          timeSlot: submission.timeSlot,
          isCompleted: submission.isCompleted,
          isSubmitted: true, // 기존 제출 데이터는 이미 제출된 것으로 간주
          submittedAt: submission.submittedAt,
          notes: submission.notes
        }
      });

      console.log(`새로운 인스턴스 생성: ${newInstance.id}`);

      // 3. 연결된 항목들의 진행 상태 마이그레이션
      for (const itemResponse of submission.itemResponses) {
        await prisma.connectedItemProgress.create({
          data: {
            instanceId: newInstance.id,
            itemId: itemResponse.templateId,
            isCompleted: itemResponse.isCompleted,
            notes: itemResponse.notes
          }
        });
      }

      console.log(`${submission.itemResponses.length}개의 항목 진행 상태를 마이그레이션했습니다.`);
    }

    console.log('데이터 마이그레이션이 완료되었습니다!');
    console.log('이제 기존 테이블들을 삭제할 수 있습니다.');

  } catch (error) {
    console.error('마이그레이션 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateData();