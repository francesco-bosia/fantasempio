import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    const isAuthenticated = !!token

    // Auth pages (signin, signup)
    const isAuthPage =
      request.nextUrl.pathname.startsWith("/auth/signin") || request.nextUrl.pathname.startsWith("/auth/signup")

    if (isAuthPage) {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL("/", request.url))
      }
      return NextResponse.next()
    }

    // Admin routes
    const isAdminRoute = request.nextUrl.pathname.startsWith("/admin")

    if (isAdminRoute) {
      if (!isAuthenticated) {
        return NextResponse.redirect(new URL("/auth/signin", request.url))
      }

      // Check if user is admin
      const response = await fetch(new URL("/api/auth/check-admin", request.url).toString(), {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      })

      const { isAdmin } = await response.json()

      if (!isAdmin) {
        return NextResponse.redirect(new URL("/", request.url))
      }

      return NextResponse.next()
    }

    // Protected routes (input)
    const isProtectedRoute = request.nextUrl.pathname.startsWith("/input")

    if (isProtectedRoute && !isAuthenticated) {
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    // If there's an error in auth, allow the request to continue
    // The pages themselves will handle unauthenticated users
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/input/:path*", "/admin/:path*", "/auth/signin", "/auth/signup"],
}
