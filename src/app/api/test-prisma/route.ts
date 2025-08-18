import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('Prisma 클라이언트 객체 확인:', Object.keys(prisma));
    
    // 사용 가능한 모델들 확인
    const availableModels = Object.keys(prisma).filter(key => 
      typeof prisma[key as keyof typeof prisma] === 'object' && 
      prisma[key as keyof typeof prisma] !== null
    );
    
    console.log('사용 가능한 모델들:', availableModels);

    // 각 모델 테스트
    const testResults: any = {};
    
    for (const modelName of availableModels) {
      try {
        const model = prisma[modelName as keyof typeof prisma] as any;
        if (model && typeof model.findMany === 'function') {
          await model.findMany({ take: 1 });
          testResults[modelName] = '✅ 정상';
        } else {
          testResults[modelName] = '❌ findMany 메서드 없음';
        }
      } catch (error: any) {
        testResults[modelName] = `❌ 오류: ${error.message}`;
      }
    }

    return NextResponse.json({
      message: 'Prisma 모델 테스트 결과',
      availableModels,
      testResults
    });

  } catch (error: any) {
    console.error('Prisma 테스트 오류:', error);
    return NextResponse.json({
      error: error.message || 'Prisma 테스트 중 오류가 발생했습니다.',
      stack: error.stack
    }, { status: 500 });
  }
}