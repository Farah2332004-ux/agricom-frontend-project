// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/en' // pick your default locale
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

// Process root and any non-static asset path
export const config = {
  matcher: ['/', '/((?!_next|.*\\..*).*)'],
}
