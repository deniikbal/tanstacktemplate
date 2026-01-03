import * as React from "react"
import {
  Database,
  GalleryVerticalEnd,
  LayoutDashboard,
  Settings,
  GraduationCap
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
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
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
          title: "Data Pengguna",
          url: "/dashboard/users",
        },
        {
          title: "Data Siswa",
          url: "/dashboard/students",
        },
        {
          title: "Data Pendaftar",
          url: "/dashboard/pendaftar",
        },
        {
          title: "Data Sekolah",
          url: "/dashboard/sekolah",
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
      title: "Setting",
      url: "/dashboard/settings",
      icon: Settings,
      isActive: false,
    },
  ],
}

export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string
    email: string
    avatar?: string | null
  }
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
