"use client"

import { usePathname } from "next/navigation"
import { signIn, signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Settings, Calendar, Menu } from "lucide-react"

export default function Header() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path
  const isAdmin = session?.user?.role === "admin"

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold">
            FantaSalute
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLinks isActive={isActive} isAdmin={isAdmin} />
          </nav>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <NavLinks isActive={isActive} isAdmin={isAdmin} dropdown />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Right Side: Avatar or Sign In */}
        <div className="flex items-center gap-4">
          {status === "authenticated" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                    <AvatarFallback>{session.user?.name?.charAt(0) || <User className="h-4 w-4" />}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{session.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/schedule">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Match Schedule</span>
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => signIn()}>Sign In</Button>
          )}
        </div>
      </div>
    </header>
  )
}

function NavLinks({ isActive, isAdmin, dropdown = false }: { isActive: (path: string) => boolean, isAdmin: boolean, dropdown?: boolean }) {
  const links = [
    { href: "/input", label: "Log Substance" },
    { href: "/schedule", label: "Schedule" },
    { href: "/standings", label: "Standings" },
    { href: "/analytics", label: "Analytics" },
  ]

  if (isAdmin) {
    links.push({ href: "/admin", label: "Admin" })
  }

  return (
    <>
      {links.map((link) => dropdown ? (
        <DropdownMenuItem key={link.href} asChild>
          <Link href={link.href}>
            {link.label}
          </Link>
        </DropdownMenuItem>
      ) : (
        <Link
          key={link.href}
          href={link.href}
          className={`text-sm font-medium transition-colors ${isActive(link.href) ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
        >
          {link.label}
        </Link>
      ))}
    </>
  )
}
