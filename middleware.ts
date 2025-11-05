import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // No authentication checks or redirections
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/inventory/:path*',
    '/expiry/:path*',
    '/recommendations/:path*',
    '/scan/:path*',
    '/nearby/:path*',
    '/profile/:path*',
  ],
}