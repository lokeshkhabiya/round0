import Link from "next/link";
import { ArrowRight, BarChart3, ClipboardList, Users, Briefcase } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const QUICK_ACTIONS = [
  {
    title: "Mock Interview Templates",
    description: "Create and calibrate role-specific interview flows.",
    href: "/mockinterviews",
    icon: ClipboardList,
  },
  {
    title: "Candidate Directory",
    description: "Review candidate activity and performance signals.",
    href: "/candidates",
    icon: Users,
  },
  {
    title: "Analytics",
    description: "Track completion rates and platform performance.",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Jobs and Mapping",
    description: "Align real job postings with preparation tracks.",
    href: "/jobs",
    icon: Briefcase,
  },
];

export default function DashboardPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 page-fade-in">
      <header className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          Round0 Admin
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance">
          Platform operations at a glance
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Manage interview templates, monitor candidate outcomes, and maintain
          platform quality from one unified control surface.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {QUICK_ACTIONS.map((item) => (
          <Card
            key={item.title}
            className="border-border/60 bg-card/74 backdrop-blur-sm"
          >
            <CardHeader className="pb-3">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <Button className="mt-5" variant="outline" asChild>
                <Link href={item.href}>
                  Open
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
