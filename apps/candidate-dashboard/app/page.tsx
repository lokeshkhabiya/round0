"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	ArrowRight,
	BarChart3,
	Bot,
	Mic,
	Sparkles,
	Zap,
} from "lucide-react";

import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import HeroSectionImage from "@/components/hero-section-image";

const VALUE_POINTS = [
	{
		title: "Adaptive mock interviews",
		description:
			"Role-aware conversations that shift difficulty based on your responses.",
		icon: Mic,
	},
	{
		title: "AI mentor follow-up",
		description:
			"Actionable post-interview coaching linked to your latest attempts.",
		icon: Bot,
	},
	{
		title: "Progress intelligence",
		description:
			"Clear score trends and practical focus areas, not noisy vanity metrics.",
		icon: BarChart3,
	},
];

const FLOW = [
	{
		number: "01",
		title: "Pick your role context",
		body: "Select interview streams that match the position and level you are preparing for.",
	},
	{
		number: "02",
		title: "Run realistic rounds",
		body: "Practice with voice, coding, and system-design capable interview sessions.",
	},
	{
		number: "03",
		title: "Refine deliberately",
		body: "Use concise feedback loops to close weak spots before the real interview.",
	},
];

export default function Home() {
	const router = useRouter();
	const { isAuthenticated } = useAuthStore();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		queueMicrotask(() => setMounted(true));
	}, []);

	useEffect(() => {
		if (mounted && isAuthenticated) {
			router.push("/mockinterview");
		}
	}, [mounted, isAuthenticated, router]);

	if (!mounted || isAuthenticated) {
		return (
			<div className="flex h-screen items-center justify-center app-surface">
				<div className="flex gap-1">
					<div
						className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce"
						style={{ animationDelay: "0ms" }}
					/>
					<div
						className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce"
						style={{ animationDelay: "140ms" }}
					/>
					<div
						className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce"
						style={{ animationDelay: "280ms" }}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen app-surface text-foreground">
			<nav className="fixed inset-x-0 top-0 z-50 border-b border-border/55 bg-background/72 backdrop-blur-xl">
				<div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
					<Link href="/" className="flex items-center gap-2.5">
						<div className="h-7 w-7 rounded-xl bg-primary/90 flex items-center justify-center shadow-sm">
							<Zap className="h-4 w-4 text-primary-foreground" />
						</div>
						<div className="leading-tight">
							<p className="text-sm font-semibold tracking-tight">Round0</p>
							<p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
								Candidate Studio
							</p>
						</div>
					</Link>

					<div className="flex items-center gap-2">
						<Button variant="ghost" size="sm" asChild>
							<Link href="/auth/login">Sign in</Link>
						</Button>
						<Button size="sm" asChild>
							<Link href="/auth/login">
								Start free
								<ArrowRight className="h-3.5 w-3.5 ml-1.5" />
							</Link>
						</Button>
					</div>
				</div>
			</nav>

			<main className="px-6 pt-28 pb-12 md:pt-32">
				<section className="mx-auto  max-w-7xl gap-8 md:gap-10 flex justify-center items-center">
					<div className="page-fade-in flex flex-col items-center justify-center">
						<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-[11px] uppercase tracking-[0.11em] text-muted-foreground shadow-xs">
							<Sparkles className="h-3.5 w-3.5 text-primary" />
							Precision interview preparation
						</div>
						<h1 className="text-balance font-serif text-3xl leading-[1.05] tracking-tight md:text-6xl">
							Practice for the real conversation, not a checklist.
						</h1>
						<p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
							Round0 helps you run realistic interviews with AI guidance, <br /> then
							turns each attempt into a focused improvement loop.
						</p>
						<div className="mt-8 flex flex-wrap items-center gap-3">
							<Button size="lg" className="h-11 px-6" asChild>
								<Link href="/auth/login">
									Begin practice
									<ArrowRight className="h-4 w-4 ml-2" />
								</Link>
							</Button>
							<Button variant="outline" size="lg" className="h-11 px-6" asChild>
								<Link href="/auth/login">Explore the platform</Link>
							</Button>
						</div>
						<div className="mt-10">
							<HeroSectionImage />
						</div>
					</div>
				</section>

				<section className="mx-auto mt-14 max-w-6xl border-t border-border/55 pt-10">
					<div className="grid gap-3 md:grid-cols-3">
						{VALUE_POINTS.map((point) => (
							<article
								key={point.title}
								className="rounded-3xl border border-border/60 bg-card/72 p-5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
							>
								<div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12">
									<point.icon className="h-5 w-5 text-primary" />
								</div>
								<h2 className="text-base font-semibold tracking-tight">{point.title}</h2>
								<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
									{point.description}
								</p>
							</article>
						))}
					</div>
				</section>

				<section className="mx-auto mt-14 max-w-6xl border-t border-border/55 pt-10">
					<div className="mb-8">
						<p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
							Process
						</p>
						<h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
							A tighter loop from practice to confidence
						</h2>
					</div>
					<div className="grid gap-4 md:grid-cols-3">
						{FLOW.map((item) => (
							<div
								key={item.number}
								className="rounded-3xl border border-border/60 bg-card/68 p-5 shadow-sm backdrop-blur-sm"
							>
								<p className="text-xs font-medium tracking-[0.13em] text-primary/85">
									{item.number}
								</p>
								<h3 className="mt-3 text-base font-semibold tracking-tight">{item.title}</h3>
								<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
									{item.body}
								</p>
							</div>
						))}
					</div>
				</section>

				<section className="mx-auto mt-14 max-w-4xl border-t border-border/55 pt-10 text-center">
					<h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
						Prepare with intent, then interview with confidence.
					</h2>
					<p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
						Everything stays focused: realistic simulations, clear feedback, and
						guided improvement.
					</p>
					<Button size="lg" className="mt-7 h-11 px-6" asChild>
						<Link href="/auth/login">
							Create your account
							<ArrowRight className="h-4 w-4 ml-2" />
						</Link>
					</Button>
				</section>
			</main>

			<footer className="border-t border-border/55 px-6 py-7">
				<div className="mx-auto flex max-w-6xl items-center justify-between text-xs text-muted-foreground">
					<p>Round0</p>
					<p>&copy; {new Date().getFullYear()} Round0 Inc.</p>
				</div>
			</footer>
		</div>
	);
}
