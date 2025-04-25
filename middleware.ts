// middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Extra admin guard
    if (pathname.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // Allow unauthenticated access only to home and auth routes
        const isPublic =
          pathname === "/" ||
          pathname.startsWith("/auth")

        if (isPublic) return true

        // All other routes require login
        return !!token
      },
    },
    pages: {
      signIn: "/auth/signin", // Redirect here if unauthorized
    },
  },
)

export const config = {
  matcher: ["/((?!_next|favicon.ico|api|.*\\.(?:svg|jpg|png|css|js)).*)"],
}
