"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Workflow,
  BarChart3,
  Eye,
  List,
  Code2,
  Settings,
  ArrowLeft,
  Download,
  Rocket,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EditorSidebarProps {
  draftId: string;
  surveyName?: string;
  status?: string;
  lastSaved?: Date;
  onDeploy?: () => void;
  onDownload?: () => void;
}

const navItems = [
  {
    name: "Flow Editor",
    href: "/flow",
    icon: Workflow,
    description: "Visual flow builder",
  },
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
    description: "Analytics configuration",
  },
  {
    name: "Preview",
    href: "/preview",
    icon: Eye,
    description: "Live survey preview",
  },
  {
    name: "JSON Config",
    href: "/json",
    icon: Code2,
    description: "Raw configuration",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Deploy & metadata",
  },
];

export function EditorSidebar({
  draftId,
  surveyName = "Untitled Survey",
  status = "GENERATED",
  lastSaved,
  onDeploy,
  onDownload,
}: EditorSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "READY":
      case "GENERATED":
        return "bg-primary/10 text-primary border-primary/20";
      case "GENERATING":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
      case "VALIDATION_FAILED":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace("_", " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r bg-card flex flex-col z-10 overflow-hidden">
      {/* Back Navigation */}
      <div className="px-4 py-3 border-b">
        <Link
          href="/clients"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Link>
      </div>

      {/* Draft Info */}
      <div className="px-4 py-4 border-b space-y-2">
        <h2 className="font-semibold text-foreground truncate" title={surveyName}>
          {surveyName}
        </h2>
        <div className="flex items-center gap-2">
          <Badge className={cn("text-xs", getStatusColor(status))}>
            {getStatusLabel(status)}
          </Badge>
        </div>
        {lastSaved && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Save className="h-3 w-3" />
            Saved {getRelativeTime(lastSaved)}
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const fullPath = `/editor/${draftId}${item.href}`;
          const isActive = pathname === fullPath;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={fullPath}
              title={item.description}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary border-l-4 border-primary ml-0 pl-2.5"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Actions Footer */}
      <div className="border-t p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button
            variant="gradient"
            size="sm"
            className="flex-1"
            onClick={onDeploy}
          >
            <Rocket className="h-4 w-4 mr-2" />
            Deploy
          </Button>
        </div>
      </div>
    </aside>
  );
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins === 1) return "1 minute ago";
  if (diffMins < 60) return `${diffMins} minutes ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return "1 hour ago";
  if (diffHours < 24) return `${diffHours} hours ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}
