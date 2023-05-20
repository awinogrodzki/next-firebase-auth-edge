import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  console.log("REQUEST URL", request.nextUrl.href, {
    typeofCaches: typeof caches,
    globalTypeofCaches: typeof global.caches,
    globalThisTypeofCaches: typeof (globalThis as any)?.caches,
  });
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/((?!_next/static|favicon.ico|logo.svg).*)"],
};
