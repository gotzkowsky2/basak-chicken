import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const isProd = process.env.NODE_ENV === "production";
  const domain = "crew.basak-chicken.com";
  const resp = NextResponse.json({ message: "로그아웃 되었습니다." }, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    }
  });

  const names = ["employee_auth", "admin_auth", "superadmin_auth", "temp_pw_auth"];
  const variants: Array<{ domain?: string }> = isProd ? [
    {},
    { domain },
    { domain: `.${domain}` },
  ] : [{}];

  for (const name of names) {
    for (const v of variants) {
      resp.cookies.set(name, "", {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: isProd,
        ...(v.domain ? { domain: v.domain } : {}),
        expires: new Date(0),
        maxAge: 0,
      });
    }
  }

  return resp;
}