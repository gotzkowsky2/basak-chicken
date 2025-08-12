import { NextRequest, NextResponse } from 'next/server';

// 운영 보안: 디버그 엔드포인트 비활성화
export async function GET(request: NextRequest) {
  return NextResponse.json({ error: 'Disabled in production' }, { status: 404 });
}