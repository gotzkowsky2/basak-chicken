import { NextRequest, NextResponse } from "next/server";
import prisma from '@/lib/prisma'

export const runtime = "nodejs";

// GET: 내 즐겨찾기 ID 목록 반환 (manualIds, precautionIds)
export async function GET(req: NextRequest) {
  try {
    const employeeId = req.cookies.get("employee_auth")?.value;
    if (!employeeId) {
      return NextResponse.json({ error: "직원 인증이 필요합니다." }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { employeeId },
      select: { targetType: true, targetId: true },
      orderBy: { createdAt: "desc" },
    });

    const manualIds = favorites
      .filter((f) => f.targetType === "MANUAL")
      .map((f) => f.targetId);
    const precautionIds = favorites
      .filter((f) => f.targetType === "PRECAUTION")
      .map((f) => f.targetId);

    return NextResponse.json({ manualIds, precautionIds });
  } catch (error) {
    console.error("즐겨찾기 조회 오류:", error);
    return NextResponse.json({ error: "즐겨찾기 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// POST: 즐겨찾기 토글 { targetType: 'MANUAL'|'PRECAUTION', targetId: string, favorite: boolean }
export async function POST(req: NextRequest) {
  try {
    const employeeId = req.cookies.get("employee_auth")?.value;
    if (!employeeId) {
      return NextResponse.json({ error: "직원 인증이 필요합니다." }, { status: 401 });
    }

    const body = await req.json();
    const { targetType, targetId, favorite } = body || {};
    if (!targetType || !targetId || typeof favorite !== "boolean") {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }

    if (!["MANUAL", "PRECAUTION"].includes(targetType)) {
      return NextResponse.json({ error: "허용되지 않는 대상 유형입니다." }, { status: 400 });
    }

    if (favorite) {
      // 추가 (존재하면 무시)
      await prisma.favorite.upsert({
        where: {
          employeeId_targetType_targetId: { employeeId, targetType, targetId },
        },
        update: {},
        create: { employeeId, targetType, targetId },
      });
    } else {
      // 삭제 (없으면 무시)
      await prisma.favorite.deleteMany({
        where: { employeeId, targetType, targetId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("즐겨찾기 토글 오류:", error);
    return NextResponse.json({ error: "즐겨찾기 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}


