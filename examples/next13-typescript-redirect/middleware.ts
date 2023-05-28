import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/((?!_next/static|favicon.ico|logo.svg).*)"],
};
