import "isomorphic-fetch";
import "dotenv/config";

declare module 'next/server' {
  export interface NextRequest {
    headers: Headers;
  }

  export interface NextResponse {
    headers: Headers;
  }
}