"use client";
import { BarChart, Briefcase, Calendar, Home, Inbox, Search, Settings, Users } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import Link from "next/link"

// Menu items.
const items = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Jobs",
    url: "/jobs",
    icon: Briefcase,
  },
  {
    title: "Candidates",
    url: "/candidates",
    icon: Users,
  },
  {
    title: "Interviews",
    url: "/interviews",
    icon: Calendar,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  
  const isItemActive = (itemUrl: string) => {
    if (itemUrl === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/"
    }
    return pathname.startsWith(itemUrl)
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon" >
		<SidebarHeader>
			<SidebarTrigger />
		</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>ZeroCV Recruiter</SidebarGroupLabel>
          <SidebarGroupContent className="mt-4">
            <SidebarMenu className="flex flex-col gap-4">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={`${isItemActive(item.url) ? "bg-gray-800 text-primary-foreground hover:bg-gray-700 hover:text-primary-foreground" : ""}`}>
                    <Link href={item.url}>
                      <item.icon />
                      <span className="text-base">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}