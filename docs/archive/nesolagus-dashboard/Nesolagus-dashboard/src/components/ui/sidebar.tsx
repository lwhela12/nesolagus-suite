// src/components/ui/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  MessageSquareText,
  FileText,
  Settings,
  Target,
  Users,
} from 'lucide-react';

type Item = {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const navItems: Item[] = [
  { name: 'Project Snapshot', href: '/',                 icon: LayoutDashboard },
  { name: 'Participant Personas',   href: '/personas',         icon: Users },
  { name: 'Community Pulse',  href: '/community-pulse',  icon: BarChart3 },
  // { name: 'Echo Patterns',    href: '/echo-patterns',    icon: TrendingUp }, // omitted per request
  { name: 'Survey Insights',  href: '/analytics',        icon: MessageSquareText },
  { name: 'Community Intelligence',   href: '/strategic-plan',   icon: Target },
  { name: 'Reports',          href: '/reports',          icon: FileText },
  { name: 'Settings',         href: '/settings',         icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen border-r bg-white flex flex-col z-10 overflow-hidden transition-[width]">
      {/* Brand row with the Nesolagus bug and product name */}
      <div id="sb-header" className="relative flex items-center gap-2 px-4 py-3 h-14 border-b flex-shrink-0">
        <img id="sb-bug" src="/logos/nesolagus-bug.png" alt="Nesolagus" className="h-12 w-12" />
        <span className="text-sm font-semibold text-[#0E2A23]" data-sb-label>Hollow UI</span>
        <button
          id="sb-toggle"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md border text-xs text-[#0E2A23]/70 z-20 bg-white"
          onClick={() => {
            const aside = document.querySelector('aside');
            const main = document.getElementById('main-content');
            const header = document.getElementById('sb-header');
            const btn = document.getElementById('sb-toggle');
            if (!aside || !main) return;
            aside.classList.toggle('w-14');
            const isCollapsed = aside.classList.contains('w-14');
            aside.classList.toggle('w-64', !isCollapsed);
            main.classList.toggle('ml-64', !isCollapsed);
            main.classList.toggle('ml-14', isCollapsed);
            // Center icons and hide labels on collapse
            document.querySelectorAll('nav a').forEach((a) => {
              const el = a as HTMLElement;
              el.classList.toggle('justify-center', isCollapsed);
              el.classList.toggle('px-0', isCollapsed);
              el.classList.toggle('px-3', !isCollapsed);
            });
            // Hide any data labels (header + nav)
            aside.querySelectorAll('[data-sb-label]').forEach((el) => {
              (el as HTMLElement).style.display = isCollapsed ? 'none' : 'inline';
            });
            const bug = document.getElementById('sb-bug');
            if (bug) {
              // Hide the logo entirely when collapsed
              (bug as HTMLElement).style.display = isCollapsed ? 'none' : 'block';
              bug.classList.toggle('h-12', !isCollapsed);
              bug.classList.toggle('w-12', !isCollapsed);
              bug.classList.toggle('h-6', isCollapsed);
              bug.classList.toggle('w-6', isCollapsed);
              // Ensure nothing blocks the toggle
              (bug as HTMLElement).style.pointerEvents = isCollapsed ? 'none' : 'auto';
            }
            const t = document.getElementById('sb-arrow');
            if (t) t.textContent = isCollapsed ? '›' : '‹';
            // Adjust header spacing so the collapse button doesn't overlap the logo in collapsed state
            if (header) {
              header.classList.toggle('px-4', !isCollapsed);
              header.classList.toggle('px-2', isCollapsed);
              header.classList.toggle('gap-2', !isCollapsed);
              header.classList.toggle('gap-0', isCollapsed);
              header.classList.toggle('justify-center', isCollapsed);
              header.classList.toggle('pr-8', isCollapsed);
              header.classList.toggle('pr-4', !isCollapsed);
            }
            // Slightly nudge the button inward when collapsed
            if (btn) btn.classList.toggle('right-1', isCollapsed);
          }}
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
        >
          <span id="sb-arrow">‹</span>
        </button>
      </div>

      {/* Nav - scrollable middle section */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.name}
            className={[
              'flex items-center gap-3 rounded-lg px-3 py-2 text-[15px] transition',
              isActive
                ? 'bg-[#E6F4EA] text-[#0E2A23] border border-[#CDEBD8]'
                : 'text-[#0E2A23]/80 hover:bg-[#E6F4EA]',
            ].join(' ')}
          >
            <Icon className="h-6 w-6" aria-hidden="true" />
            <span className="truncate" data-sb-label>{item.name}</span>
          </Link>
        );
        })}
      </nav>

      {/* Client Login - Fixed at bottom */}
      <div className="border-t p-3 bg-white flex-shrink-0">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: '#64B37A' }}>
            AR
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900 text-sm">Amanda Roy</div>
            <div className="text-xs text-gray-500">GHAC CEO</div>
          </div>
        </div>
        <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 px-3 rounded-lg transition-colors">
          Sign Out
        </button>
      </div>
    </aside>
  );
}
