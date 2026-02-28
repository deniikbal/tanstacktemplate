import * as React from "react"
import {
  Database,
  GalleryVerticalEnd,
  LayoutDashboard,
  Settings,
  GraduationCap,
  ClipboardList,
  QrCode
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: false,
    },
    {
      title: "Data Master",
      url: "#",
      icon: Database,
      isActive: false,
      items: [
        {
          title: "Data Pendaftar",
          url: "/dashboard/pendaftar",
        },
        {
          title: "Data Sekolah",
          url: "/dashboard/sekolah",
          adminOnly: true,
        },
        {
          title: "Jadwal SPMB",
          url: "/dashboard/jadwal-spmb",
          adminOnly: true,
        },
        {
          title: "Data Pengguna",
          url: "/dashboard/users",
          adminOnly: true,
        },
        {
          title: "Data Siswa",
          url: "/dashboard/students",
          adminOnly: true,
        },
        {
          title: "Laporan Kegiatan",
          url: "/dashboard/activity-reports",
          adminOnly: true,
        },
      ],
    },

    {
      title: "Kelulusan",
      url: "/dashboard/kelulusan",
      icon: GraduationCap,
      isActive: false,
    },
    {
      title: "Daftar Ulang",
      url: "/dashboard/daftar-ulang",
      icon: ClipboardList,
      isActive: false,
    },
    {
      title: "Scanner",
      url: "/scanner",
      icon: QrCode,
      isActive: false,
    },
    {
      title: "Setting",
      url: "/dashboard/settings",
      icon: Settings,
      isActive: false,
      adminOnly: true,
    },
  ],
}

export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string
    email: string
    avatar?: string | null
    role?: string
  }
}) {
  const filteredNavMain = data.navMain.filter(item => {
    // If user is not admin, hide adminOnly items
    const userRole = user.role?.toLowerCase()
    if (userRole !== 'admin' && (item as any).adminOnly) return false
    return true
  }).map(item => {
    if (item.items) {
      return {
        ...item,
        items: item.items.filter(subItem => {
          const userRole = user.role?.toLowerCase()
          if (userRole !== 'admin' && (subItem as any).adminOnly) return false
          return true
        })
      }
    }
    return item
  })

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <NavMain items={filteredNavMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
