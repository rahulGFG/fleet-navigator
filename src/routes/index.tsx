import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Truck,
  Users,
  MapPin,
  ShieldCheck,
  Zap,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Route as RouteIcon,
  Clock,
  Globe,
} from "lucide-react";
import heroImg from "@/assets/landing-hero.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FleetFlow — Modern Transport Management System" },
      {
        name: "description",
        content:
          "Manage vehicles, drivers, and trips in one beautiful, real-time dashboard. Built for modern logistics teams.",
      },
      { property: "og:title", content: "FleetFlow — Modern Transport Management" },
      {
        property: "og:description",
        content: "All your fleet operations in one place. Vehicles, drivers, trips — done right.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <LogoStrip />
      <Features />
      <Stats />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <a href="#" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            F
          </div>
          <span className="font-semibold tracking-tight">FleetFlow</span>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#how" className="text-muted-foreground hover:text-foreground transition-colors">
            How it works
          </a>
          <a href="#stats" className="text-muted-foreground hover:text-foreground transition-colors">
            Why us
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="hidden sm:inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
          <Button asChild size="sm">
            <Link to="/dashboard">
              Open Dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />
      <div className="container mx-auto px-4 sm:px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              New · Real-time trip tracking
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
              Run your fleet with
              <span className="block bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent">
                clarity & speed.
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              FleetFlow is the modern transport management system for logistics teams.
              Manage vehicles, drivers, and trips in one beautiful dashboard — no spreadsheets, no chaos.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="shadow-lg shadow-primary/20">
                <Link to="/dashboard">
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#features">See features</a>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" /> No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Setup in 2 minutes
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Cancel anytime
              </span>
            </div>
          </div>
          <div className="relative animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 via-chart-4/10 to-transparent blur-3xl -z-10" />
            <div className="overflow-hidden rounded-2xl border shadow-2xl">
              <img
                src={heroImg}
                alt="Fleet of trucks on the highway at sunset"
                width={1600}
                height={1024}
                className="w-full h-auto object-cover"
              />
            </div>
            <FloatingCard
              className="absolute -left-4 sm:-left-6 top-8 hidden sm:block"
              icon={Truck}
              label="Active Vehicles"
              value="142"
              delta="+12 today"
            />
            <FloatingCard
              className="absolute -right-4 sm:-right-6 bottom-8 hidden sm:block"
              icon={RouteIcon}
              label="On-Time Rate"
              value="98.4%"
              delta="this week"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingCard({
  className,
  icon: Icon,
  label,
  value,
  delta,
}: {
  className?: string;
  icon: typeof Truck;
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div
      className={`rounded-xl border bg-card/95 backdrop-blur p-4 shadow-xl ${className ?? ""}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold leading-tight">{value}</p>
          <p className="text-[10px] text-primary font-medium">{delta}</p>
        </div>
      </div>
    </div>
  );
}

function LogoStrip() {
  const logos = ["LOGISTICA", "FREIGHTCO", "ROUTEX", "HAULPRO", "CARGOLINE", "DRIVELY"];
  return (
    <section className="border-y bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-6">
          Trusted by logistics teams worldwide
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60">
          {logos.map((l) => (
            <span key={l} className="text-sm font-bold tracking-widest text-muted-foreground">
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: Truck,
    title: "Vehicle Management",
    desc: "Register your entire fleet, track status, capacity, and maintenance — all in one place.",
  },
  {
    icon: Users,
    title: "Driver Roster",
    desc: "Onboard drivers, manage licenses and assignments. Know who's available at a glance.",
  },
  {
    icon: MapPin,
    title: "Trip Scheduling",
    desc: "Create trips with dynamic vehicle and driver pickers. Track from scheduled to completed.",
  },
  {
    icon: BarChart3,
    title: "Live Dashboard",
    desc: "Real-time stats on fleet size, drivers, and active trips. Updated the moment you change anything.",
  },
  {
    icon: ShieldCheck,
    title: "Reliable & Secure",
    desc: "Built with modern best practices. Your data stays yours — persisted locally, always available.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    desc: "Instant search, smooth animations, and zero loading states. It just works.",
  },
];

function Features() {
  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Everything your fleet needs.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful tools for vehicles, drivers, and trips — designed to feel effortless.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border bg-card p-6 transition-all hover:shadow-xl hover:-translate-y-1 hover:border-primary/40"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { value: "10K+", label: "Vehicles tracked" },
    { value: "98.4%", label: "On-time delivery" },
    { value: "2M+", label: "Trips completed" },
    { value: "24/7", label: "Real-time sync" },
  ];
  return (
    <section id="stats" className="py-20 bg-sidebar text-sidebar-foreground relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, var(--sidebar-primary) 0%, transparent 50%), radial-gradient(circle at 80% 70%, var(--chart-4) 0%, transparent 50%)",
        }}
        aria-hidden
      />
      <div className="container mx-auto px-4 sm:px-6 relative">
        <div className="max-w-2xl mb-12">
          <p className="text-sm font-semibold text-sidebar-primary uppercase tracking-wider mb-3">
            By the numbers
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Built for scale.
          </h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="border-l-2 border-sidebar-primary pl-5">
              <p className="text-4xl lg:text-5xl font-bold tracking-tight">{s.value}</p>
              <p className="mt-2 text-sm text-sidebar-foreground/70">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: Truck,
      title: "1. Add your vehicles",
      desc: "Register your fleet with plate numbers, models, capacity, and status.",
    },
    {
      icon: Users,
      title: "2. Onboard your drivers",
      desc: "Add driver details and keep their availability up to date.",
    },
    {
      icon: MapPin,
      title: "3. Schedule trips",
      desc: "Assign a vehicle and driver to each route. Track progress in real time.",
    },
  ];
  return (
    <section id="how" className="py-20 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Up and running in minutes.
          </h2>
        </div>
        <div className="grid gap-8 lg:grid-cols-3 relative">
          <div
            className="hidden lg:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-border to-transparent"
            aria-hidden
          />
          {steps.map((s) => (
            <div key={s.title} className="relative text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-card border-2 border-primary/20 text-primary shadow-lg shadow-primary/10">
                <s.icon className="h-10 w-10" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-chart-4 p-10 sm:p-16 text-primary-foreground">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden />
          <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden />
          <div className="relative max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Ready to take control of your fleet?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/85">
              Open your dashboard and start managing vehicles, drivers, and trips today.
              No setup, no friction.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/dashboard">
                  Open Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <a href="#features">Learn more</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t py-10 mt-4">
      <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
            F
          </div>
          <span className="font-semibold text-foreground">FleetFlow</span>
          <span className="ml-2">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <Globe className="h-4 w-4" /> Global
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> 24/7 sync
          </span>
        </div>
      </div>
    </footer>
  );
}
