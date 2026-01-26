"use client";
import {  Briefcase, Home, Inbox, MessageCircleMore, MonitorCheck, Settings, ChevronRight, MessageCircle, Calendar } from "lucide-react"
import { useState } from "react"

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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/stores/auth-store"
import { getMentorSessions, MentorSession } from "@/api/operations/mentor-api"

// Menu items.
const items = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Mock Interview",
    url: "/mockinterview",
    icon: MonitorCheck,
  },
  {
    title: "Mentor",
    url: "/mentor",
    icon: MessageCircleMore ,
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
  const { token } = useAuthStore()
  const [mentorSessions, setMentorSessions] = useState<MentorSession[]>([])
  const [isMentorExpanded, setIsMentorExpanded] = useState(false)
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  
  const isItemActive = (itemUrl: string) => {
    if (itemUrl === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/"
    }
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

  return (
    <Sidebar variant="sidebar" collapsible="icon" >
		<SidebarHeader>
			<SidebarTrigger />
		</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>ZeroCV Candidate</SidebarGroupLabel>
          <SidebarGroupContent className="mt-4">
            <SidebarMenu className="flex flex-col gap-4">
              {items.map((item) => {
                // Special handling for Mentor item
                if (item.title === "Mentor") {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        onClick={handleMentorClick}
                        className={`${isItemActive(item.url) ? "bg-gray-800 text-primary-foreground hover:bg-gray-700 hover:text-primary-foreground" : ""} cursor-pointer`}
                      >
                        <item.icon />
                        <span className="text-base">{item.title}</span>
                        <ChevronRight className={`ml-auto h-4 w-4 transition-transform ${isMentorExpanded ? 'rotate-90' : ''}`} />
                      </SidebarMenuButton>
                      
                      {isMentorExpanded && (
                        <SidebarMenuSub className="mt-2">
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild>
                              <Link href="/mentor">
                                <MessageCircle className="h-4 w-4" />
                                <span>New Chat</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          
                          {isLoadingSessions ? (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton className="opacity-50 cursor-not-allowed">
                                <Calendar className="h-4 w-4" />
                                <span>Loading sessions...</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ) : (
                            mentorSessions.map((session) => (
                              <SidebarMenuSubItem key={session.id}>
                                <SidebarMenuSubButton 
                                  onClick={() => handleSessionClick(session.id)}
                                  className="cursor-pointer"
                                >
                                  <Calendar className="h-4 w-4" />
                                  <span className="truncate">{formatSessionTitle(session)}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))
                          )}
                          
                          {!isLoadingSessions && mentorSessions.length === 0 && (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton className="opacity-50 cursor-not-allowed">
                                <Calendar className="h-4 w-4" />
                                <span>No sessions yet</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  )
                }

                // Regular menu items
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className={`${isItemActive(item.url) ? "bg-gray-800 text-primary-foreground hover:bg-gray-700 hover:text-primary-foreground" : ""}`}>
                      <Link href={item.url}>
                        <item.icon />
                        <span className="text-base">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}