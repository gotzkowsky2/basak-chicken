import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const host = (req.headers.get("host") || "crew.basak-chicken.com").split(":")[0];
  const resp = NextResponse.json({ message: "로그아웃 되었습니다." }, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    }
  });

  const names = ["employee_auth", "admin_auth", "superadmin_auth", "temp_pw_auth"];
  const domainVariants: Array<string | undefined> = [
    undefined,
    host,
    `.${host}`,
    "crew.basak-chicken.com",
    ".crew.basak-chicken.com",
  ];
  const secureVariants: boolean[] = [true, false];

  for (const name of names) {
    for (const d of domainVariants) {
      for (const s of secureVariants) {
        resp.cookies.set(name, "", {
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          ...(d ? { domain: d } : {}),
          secure: s,
          expires: new Date(0),
          maxAge: 0,
        });
      }
    }
  }

  return resp;
}