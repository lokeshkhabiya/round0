import { AppSidebar } from "@/components/app-sidebar"
import { AppTopbar } from "@/components/app-topbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"


export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="app-surface min-h-svh">
        <AppTopbar />
        <div className="flex-1 min-h-0 page-fade-in">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
