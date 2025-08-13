import { NextRequest, NextResponse } from "next/server";
import { serialize } from "cookie";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const isProd = process.env.NODE_ENV === "production";
  const host = (req.headers.get("host") || "crew.basak-chicken.com").split(":")[0];
  const canonical = "crew.basak-chicken.com";

  const resp = NextResponse.json({ message: "로그아웃 되었습니다." }, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "Clear-Site-Data": '"cookies"',
    }
  });

  const names = ["employee_auth", "admin_auth", "superadmin_auth", "temp_pw_auth"];
  const domainVariants: Array<string | undefined> = [
    undefined,
    host,
    `.${host}`,
    canonical,
    `.${canonical}`,
  ];
  const secureVariants: boolean[] = [true, false];
  const pathVariants: string[] = ["/", "/employee", "/admin", "/api"];
  const sameSiteVariants: Array<"lax"|"none"|"strict"> = ["lax", "none", "strict"];

  for (const name of names) {
    for (const d of domainVariants) {
      for (const p of pathVariants) {
        for (const s of secureVariants) {
          for (const ss of sameSiteVariants) {
            const cookieStr = serialize(name, "", {
              httpOnly: true,
              path: p,
              sameSite: ss,
              ...(d ? { domain: d } : {}),
              secure: s,
              expires: new Date(0),
              maxAge: 0,
            });
            resp.headers.append("Set-Cookie", cookieStr);
          }
        }
      }
    }
  }

  // 호스트 전용 보안 쿠키 삭제 (__Host-*)
  const hostOnly = [
    "__Host-employee_auth",
    "__Host-admin_auth",
    "__Host-temp_pw_auth",
    "__Host-superadmin_auth",
    // 레거시 명칭 호환 제거
    "__Host-employee",
    "__Host-admin",
    "_Host-employee",
    "_Host-admin",
  ];
  for (const n of hostOnly) {
    const cookieStr = serialize(n, "", {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: true,
      expires: new Date(0),
      maxAge: 0,
    });
    resp.headers.append("Set-Cookie", cookieStr);
  }

  return resp;
}