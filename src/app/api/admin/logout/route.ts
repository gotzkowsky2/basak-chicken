import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // nodejs 런타임 강제

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ message: "로그아웃 되었습니다." }, {
    headers: {
      "Cache-Control": "no-store",
      "Clear-Site-Data": '"cookies"',
    }
  });

  const base = {
    httpOnly: true,
    maxAge: -1,
    expires: new Date(0),
    sameSite: 'lax' as const,
    secure: false,
  } as const;

  const domains = [undefined, 'crew.basak-chicken.com', '.crew.basak-chicken.com'];
  const paths = ['/', '/employee', '/admin'];
  const names = ['employee_auth', 'admin_auth', 'superadmin_auth', 'temp_pw_auth'] as const;

  for (const name of names) {
    for (const p of paths) res.cookies.set(name, '', { ...base, path: p });
    for (const d of domains) {
      if (!d) continue;
      for (const p of paths) res.cookies.set(name, '', { ...base, path: p, domain: d });
    }
  }

  return res;
} 