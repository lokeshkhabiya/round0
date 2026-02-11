"use client";

import { usePathname, useRouter } from "next/navigation";
import { Moon, Search, Sparkles, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

const ROUTE_META: Array<{
  startsWith: string;
  title: string;
  subtitle?: string;
}> = [
  {
    startsWith: "/dashboard",
    title: "Platform Overview",
    subtitle: "Operational summary across interviews and candidates.",
  },
  {
    startsWith: "/mockinterviews",
    title: "Mock Interview Library",
    subtitle: "Manage templates, tools, and role calibration.",
  },
  {
    startsWith: "/analytics",
    title: "Performance Analytics",
    subtitle: "Outcomes, completion, and category-level trends.",
  },
  {
    startsWith: "/jobs",
    title: "Jobs and Mappings",
    subtitle: "Connect real listings to interview preparation.",
  },
  {
    startsWith: "/recruiters",
    title: "Recruiter Network",
    subtitle: "Company and recruiter visibility.",
  },
  {
    startsWith: "/candidates",
    title: "Candidate Directory",
    subtitle: "Candidate records and interview signals.",
  },
  {
    startsWith: "/settings",
    title: "Workspace Settings",
    subtitle: "System and platform preferences.",
  },
];

function getRouteMeta(pathname: string) {
  return ROUTE_META.find((item) => pathname.startsWith(item.startsWith)) ?? {
    title: "Round0 Admin",
    subtitle: "Administration workspace",
  };
}

export function AppTopbar({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const meta = getRouteMeta(pathname);
  const isDark = theme === "dark";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl",
        className
      )}
    >
      <div className="mx-auto flex h-14 w-full items-center gap-3 px-4 md:px-8">
        <SidebarTrigger className="h-9 w-9 rounded-xl" />

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">
            {meta.title}
          </p>
          {meta.subtitle ? (
            <p className="hidden truncate text-[11px] text-muted-foreground sm:block">
              {meta.subtitle}
            </p>
          ) : null}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden h-9 gap-2 rounded-xl md:inline-flex"
            onClick={() => router.push("/candidates")}
          >
            <Search className="h-4 w-4" />
            Find candidates
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hidden h-9 gap-2 rounded-xl lg:inline-flex"
            onClick={() => router.push("/mockinterviews/create")}
          >
            <Sparkles className="h-4 w-4" />
            New template
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
