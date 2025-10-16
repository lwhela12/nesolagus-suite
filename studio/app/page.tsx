import Link from "next/link";
import { Sparkles, Eye, Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-secondary to-background dark:from-card dark:to-background">
      <main className="container flex flex-col items-center justify-center gap-16 px-4 py-16">
        {/* Hero Section */}
        <div className="flex flex-col items-center gap-6 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Survey Generation</span>
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-foreground">Build Better Surveys </span>
            <span className="gradient-text">Faster</span>
          </h1>

          <p className="max-w-2xl text-xl text-muted-foreground leading-relaxed">
            Transform discovery documents into intelligent, conversational surveys in minutes.
            Design, preview, and deploy—all from one platform.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl w-full">
          <FeatureCard
            title="Generate"
            description="Upload discovery documents and let AI architect your survey structure with intelligent question flows"
            icon={Sparkles}
            delay="0"
          />
          <FeatureCard
            title="Preview"
            description="Experience your survey in real-time with live preview, testing tools, and theme customization"
            icon={Eye}
            delay="100"
          />
          <FeatureCard
            title="Deploy"
            description="Launch to production with one click. Automated deployment, custom domains, and analytics included"
            icon={Rocket}
            delay="200"
          />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link href="/generate">
            <Button size="lg" className="group bg-gradient-to-r from-primary to-primary-foreground hover:opacity-90 transition-all shadow-lg hover:shadow-xl">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/clients">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all"
            >
              View Clients
            </Button>
          </Link>
        </div>

        {/* Stats or Social Proof (Optional) */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse-green" />
            <span>Powered by Claude AI</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse-green" />
            <span>Sub-minute generation</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse-green" />
            <span>One-click deployment</span>
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon: Icon,
  delay,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  delay: string;
}) {
  return (
    <div
      className="group flex flex-col items-center gap-4 rounded-xl border bg-card p-8 shadow-sm hover-lift card-elevated transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-foreground shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all">
        <Icon className="h-7 w-7 text-white" />
      </div>
      <h3 className="text-xl font-bold text-foreground">{title}</h3>
      <p className="text-center text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
