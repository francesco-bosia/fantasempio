// lib/auth-utils.ts
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function getTokenSafe(req: NextRequest | Request) {
  if ("nextUrl" in req) {
    return await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  }

  if (req instanceof Request) {
    const headers = Object.fromEntries(req.headers.entries())
    return await getToken({
      req: { headers } as unknown as NextRequest,
      secret: process.env.NEXTAUTH_SECRET,
    })
  }

  return null
}


export async function isAdmin(req: NextRequest | Request) {
  const token = await getTokenSafe(req)
  return token?.role === "admin"
}

export async function getUserRole(req: NextRequest | Request): Promise<string | null> {
  const token = await getTokenSafe(req)
  return token?.role ?? null
}
