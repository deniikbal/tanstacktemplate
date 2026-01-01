import { createFileRoute, useNavigate, Outlet, useMatches } from '@tanstack/react-router'
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"
import { useEffect } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { LogOut, Settings, User, ChevronDown } from "lucide-react"
import { toast } from "sonner"

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

// Map route paths to display names
const routeNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/users': 'Manajemen User',
  '/dashboard/students': 'Data Siswa',
}

function DashboardLayout() {
  const { data: session, isPending } = authClient.useSession()
  const navigate = useNavigate()
  const matches = useMatches()

  useEffect(() => {
    if (!isPending && !session) {
      navigate({ to: '/login' })
    }
  }, [session, isPending, navigate])

  if (isPending) return <LoadingSpinner />
  if (!session) return null

  const userData = {
    name: session.user.name,
    email: session.user.email,
    avatar: session.user.image,
  }

  // Get current route path for breadcrumb
  const currentPath = matches[matches.length - 1]?.pathname || '/dashboard'
  const isSubPage = currentPath !== '/dashboard'
  const currentPageName = routeNames[currentPath] || 'Dashboard'

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleLogout = async () => {
    try {
      await authClient.signOut()
      toast.success('Berhasil logout')
      navigate({ to: '/login' })
    } catch (error) {
      toast.error('Gagal logout')
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar user={userData} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {isSubPage && (
                  <>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{currentPageName}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userData.avatar || undefined} alt={userData.name} />
                  <AvatarFallback className="bg-emerald-600 text-white text-xs">
                    {getInitials(userData.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start text-sm">
                  <span className="font-medium">{userData.name}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userData.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{userData.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Pengaturan</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
