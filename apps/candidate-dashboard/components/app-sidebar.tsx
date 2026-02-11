"use client";

import {
  Briefcase,
  Calendar,
  ChevronRight,
  Inbox,
  LogOut,
  MessageCircle,
  MessageCircleMore,
  MonitorCheck,
  Settings,
  Zap,
} from "lucide-react";
import { useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/stores/auth-store"
import { getMentorSessions, MentorSession } from "@/api/operations/mentor-api"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const items = [
  {
    title: "Mock Interview",
    url: "/mockinterview",
    icon: MonitorCheck,
  },
  {
    title: "Mentor",
    url: "/mentor",
    icon: MessageCircleMore,
  },
  {
    title: "Jobs",
    url: "/jobs",
    icon: Briefcase,
  },
  {
    title: "Applications",
    url: "/applications",
    icon: Inbox,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { token, user, logout } = useAuthStore()
  const { state } = useSidebar()
  const [mentorSessions, setMentorSessions] = useState<MentorSession[]>([])
  const [isMentorExpanded, setIsMentorExpanded] = useState(false)
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)

  const isItemActive = (itemUrl: string) => {
    return pathname.startsWith(itemUrl)
  }

  const fetchMentorSessions = async () => {
    if (!token) return
    setIsLoadingSessions(true)
    try {
      const response = await getMentorSessions(token)
      if (response.success) {
        setMentorSessions(response.data)
      }
    } catch (error) {
      console.error('Error fetching mentor sessions:', error)
    } finally {
      setIsLoadingSessions(false)
    }
  }

  const handleMentorClick = () => {
    if (!isMentorExpanded) {
      fetchMentorSessions()
    }
    setIsMentorExpanded(!isMentorExpanded)
  }

  const handleSessionClick = (sessionId: string) => {
    router.push(`/mentor?session=${sessionId}`)
  }

  const formatSessionTitle = (session: MentorSession) => {
    if (session.title) return session.title
    const date = new Date(session.created_at)
    return `Session ${date.toLocaleDateString()}`
  }

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
            <Zap className="h-4 w-4 text-primary" />
          {state === "expanded" && (
            <span className="font-semibold text-sm tracking-tight">Round0</span>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="flex flex-col gap-0.5">
              {items.map((item) => {
                if (item.title === "Mentor") {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        onClick={handleMentorClick}
                        isActive={isItemActive(item.url)}
                        tooltip={item.title}
                        className="cursor-pointer"
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm">{item.title}</span>
                        <ChevronRight className={`ml-auto h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${isMentorExpanded ? 'rotate-90' : ''}`} />
                      </SidebarMenuButton>

                      {isMentorExpanded && (
                          <SidebarMenuSub className="mt-1">
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild>
                              <Link href="/mentor">
                                <MessageCircle className="h-3.5 w-3.5" />
                                <span className="text-xs">New Chat</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>

                          {isLoadingSessions ? (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton className="opacity-50 cursor-not-allowed">
                                <Calendar className="h-3.5 w-3.5" />
                                <span className="text-xs">Loading...</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ) : (
                            mentorSessions.map((session) => (
                              <SidebarMenuSubItem key={session.id}>
                                <SidebarMenuSubButton
                                  onClick={() => handleSessionClick(session.id)}
                                  className="cursor-pointer"
                                >
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span className="truncate text-xs">{formatSessionTitle(session)}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))
                          )}

                          {!isLoadingSessions && mentorSessions.length === 0 && (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton className="opacity-50 cursor-not-allowed">
                                <Calendar className="h-3.5 w-3.5" />
                                <span className="text-xs">No sessions yet</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  )
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isItemActive(item.url)}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 px-2 py-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
              {user?.email?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{user?.email || "User"}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-muted/70 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
