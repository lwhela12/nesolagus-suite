"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Sparkles, Users, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

export function AppHeader() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const navigation = [
    {
      name: "Generate",
      href: "/generate",
      icon: Sparkles,
    },
    {
      name: "Clients",
      href: "/clients",
      icon: Users,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 transition-transform group-hover:scale-110">
            <Image
              src="/logos/nesolagus-bug.png"
              alt="Nesolagus"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div className="relative w-28 h-6 hidden sm:block">
            <Image
              src="/logos/nesolagus-horizontal.png"
              alt="Nesolagus Studio"
              width={112}
              height={24}
              className="object-contain"
              priority
            />
          </div>
          <span className="text-sm font-medium text-muted-foreground hidden md:inline">
            Studio
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2",
                    isActive &&
                      "bg-gradient-to-r from-primary to-primary-foreground hover:opacity-90"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.name}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Right Section - Theme Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
