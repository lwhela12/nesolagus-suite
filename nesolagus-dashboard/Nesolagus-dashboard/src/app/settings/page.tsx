"use client";

import { useEffect, useState } from "react";
import { Bell, Download, Shield, User, Settings2, CreditCard } from "lucide-react";
import AppHeader from "@/components/ui/app-header";

type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  organization: string;
  department: string;
  bio: string;
  timezone: string;
  language: string;
};

type DashboardPrefs = {
  primaryFrom: string;
  primaryTo: string;
  compactUI: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  showPercentages: boolean;
  defaultChartType: 'bar' | 'line' | 'donut';
  dataRetention: number;
  exportFormat: 'csv' | 'json' | 'pdf';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  theme: 'light' | 'dark' | 'auto';
  showGridlines: boolean;
  animateCharts: boolean;
  defaultView: 'overview' | 'analytics' | 'reports';
};

type NotificationPrefs = {
  emailReports: boolean;
  dataAlerts: boolean;
  systemUpdates: boolean;
  weeklyDigest: boolean;
  alertThreshold: number;
  reportFrequency: 'daily' | 'weekly' | 'monthly';
  pushNotifications: boolean;
  smsAlerts: boolean;
};

type BillingInfo = {
  plan: 'essential' | 'professional' | 'warren-suite' | 'enterprise';
  billingCycle: 'monthly' | 'annual';
  nextBilling: string;
  paymentMethod: string;
  billingEmail: string;
  companyName: string;
  taxId: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
};

type SecurityPrefs = {
  sessionTimeout: number;
  requireMFA: boolean;
  allowDataExport: boolean;
  logActivity: boolean;
  shareAnalytics: boolean;
  loginNotifications: boolean;
  apiAccess: boolean;
};

const PROFILE_KEY = "warren:profile:v1";
const PREFS_KEY = "warren:prefs:v2";
const NOTIFICATION_KEY = "warren:notifications:v1";
const BILLING_KEY = "warren:billing:v1";
const SECURITY_KEY = "warren:security:v1";

const PROFILE_DEFAULTS: UserProfile = {
  firstName: "Amanda",
  lastName: "Roy",
  email: "amanda.roy@ghac.org",
  phone: "+1 (860) 555-0147",
  title: "Development Director",
  organization: "Greater Hartford Arts Council",
  department: "Development & Community Engagement",
  bio: "Passionate about connecting arts organizations with their communities through data-driven insights.",
  timezone: "America/New_York",
  language: "en-US",
};

const PREFS_DEFAULTS: DashboardPrefs = {
  primaryFrom: "#64B37A",
  primaryTo: "#2F6D49",
  compactUI: false,
  autoRefresh: true,
  refreshInterval: 300,
  showPercentages: true,
  defaultChartType: 'bar',
  dataRetention: 365,
  exportFormat: 'csv',
  dateFormat: 'MM/DD/YYYY',
  theme: 'light',
  showGridlines: true,
  animateCharts: true,
  defaultView: 'overview',
};

const NOTIFICATION_DEFAULTS: NotificationPrefs = {
  emailReports: true,
  dataAlerts: true,
  systemUpdates: true,
  weeklyDigest: true,
  alertThreshold: 10,
  reportFrequency: 'weekly',
  pushNotifications: false,
  smsAlerts: false,
};

const BILLING_DEFAULTS: BillingInfo = {
  plan: 'warren-suite',
  billingCycle: 'annual',
  nextBilling: '2025-03-15',
  paymentMethod: '**** **** **** 4532',
  billingEmail: 'billing@ghac.org',
  companyName: 'Greater Hartford Arts Council',
  taxId: '06-1234567',
  address: {
    street: '233 Pearl Street',
    city: 'Hartford',
    state: 'CT',
    zip: '06103',
    country: 'United States',
  },
};

const SECURITY_DEFAULTS: SecurityPrefs = {
  sessionTimeout: 480,
  requireMFA: true,
  allowDataExport: true,
  logActivity: true,
  shareAnalytics: false,
  loginNotifications: true,
  apiAccess: false,
};

function Section({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <header>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle ? <p className="text-sm text-gray-500 mt-1">{subtitle}</p> : null}
      </header>
      <div className="space-y-4">{children}</div>
      {footer ? <footer className="pt-4 border-t">{footer}</footer> : null}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 sm:grid-cols-[200px_1fr] items-start">
      <span className="text-sm font-medium text-gray-800 pt-2">{label}</span>
      {children}
    </label>
  );
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>(PROFILE_DEFAULTS);
  const [prefs, setPrefs] = useState<DashboardPrefs>(PREFS_DEFAULTS);
  const [notifications, setNotifications] = useState<NotificationPrefs>(NOTIFICATION_DEFAULTS);
  const [billing, setBilling] = useState<BillingInfo>(BILLING_DEFAULTS);
  const [security, setSecurity] = useState<SecurityPrefs>(SECURITY_DEFAULTS);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'account' | 'preferences' | 'notifications' | 'billing' | 'security'>('account');

  // load
  useEffect(() => {
    try {
      const rawProfile = localStorage.getItem(PROFILE_KEY);
      if (rawProfile) setProfile({ ...PROFILE_DEFAULTS, ...(JSON.parse(rawProfile) as Partial<UserProfile>) });
    } catch {}

    try {
      const rawPrefs = localStorage.getItem(PREFS_KEY);
      if (rawPrefs) setPrefs({ ...PREFS_DEFAULTS, ...(JSON.parse(rawPrefs) as Partial<DashboardPrefs>) });
    } catch {}

    try {
      const rawNotifications = localStorage.getItem(NOTIFICATION_KEY);
      if (rawNotifications) setNotifications({ ...NOTIFICATION_DEFAULTS, ...(JSON.parse(rawNotifications) as Partial<NotificationPrefs>) });
    } catch {}

    try {
      const rawBilling = localStorage.getItem(BILLING_KEY);
      if (rawBilling) setBilling({ ...BILLING_DEFAULTS, ...(JSON.parse(rawBilling) as Partial<BillingInfo>) });
    } catch {}

    try {
      const rawSecurity = localStorage.getItem(SECURITY_KEY);
      if (rawSecurity) setSecurity({ ...SECURITY_DEFAULTS, ...(JSON.parse(rawSecurity) as Partial<SecurityPrefs>) });
    } catch {}
  }, []);

  function saveProfile(next: UserProfile) {
    setProfile(next);
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
      setSavedAt(new Date().toLocaleTimeString());
    } catch {}
  }

  function savePrefs(next: DashboardPrefs) {
    setPrefs(next);
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      setSavedAt(new Date().toLocaleTimeString());
      // also update CSS vars live
      const root = document.documentElement;
      root.style.setProperty("--brand-from", next.primaryFrom);
      root.style.setProperty("--brand-to", next.primaryTo);
      if (next.compactUI) root.classList.add("ui-compact");
      else root.classList.remove("ui-compact");
    } catch {}
  }

  function saveNotifications(next: NotificationPrefs) {
    setNotifications(next);
    try {
      localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(next));
      setSavedAt(new Date().toLocaleTimeString());
    } catch {}
  }

  function saveBilling(next: BillingInfo) {
    setBilling(next);
    try {
      localStorage.setItem(BILLING_KEY, JSON.stringify(next));
      setSavedAt(new Date().toLocaleTimeString());
    } catch {}
  }

  function saveSecurity(next: SecurityPrefs) {
    setSecurity(next);
    try {
      localStorage.setItem(SECURITY_KEY, JSON.stringify(next));
      setSavedAt(new Date().toLocaleTimeString());
    } catch {}
  }

  function resetDefaults() {
    saveProfile(PROFILE_DEFAULTS);
    savePrefs(PREFS_DEFAULTS);
    saveNotifications(NOTIFICATION_DEFAULTS);
    saveBilling(BILLING_DEFAULTS);
    saveSecurity(SECURITY_DEFAULTS);
  }

  function downloadJSON() {
    const allSettings = {
      profile,
      preferences: prefs,
      notifications,
      billing,
      security,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(allSettings, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "warren-dashboard-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  const sections = [
    { id: 'account' as const, label: 'Account', icon: User, description: 'Profile information and personal details' },
    { id: 'preferences' as const, label: 'Preferences', icon: Settings2, description: 'Dashboard customization and display options' },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell, description: 'Email alerts and communication preferences' },
    { id: 'billing' as const, label: 'Billing', icon: CreditCard, description: 'Subscription plan and payment information' },
    { id: 'security' as const, label: 'Security', icon: Shield, description: 'Privacy settings and access controls' },
  ];

  return (
    <main className="min-h-screen bg-[#F7F7F6] text-[#0E2A23] p-6 space-y-6">
      <AppHeader title="Settings" subtitle="Manage your account and dashboard preferences" />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`${
                    activeSection === section.id
                      ? 'bg-[#E6F4EA] text-[#0E2A23] border-[#64B37A]'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  } w-full text-left p-4 rounded-xl border flex items-start gap-3 transition-colors`}
                >
                  <Icon className={`h-5 w-5 mt-0.5 ${
                    activeSection === section.id ? 'text-[#64B37A]' : 'text-gray-400'
                  }`} />
                  <div>
                    <div className="font-medium text-sm">{section.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{section.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow border">
            <div className="p-6">
              {activeSection === 'account' && (
                <div className="space-y-8">
                  {/* Profile Header */}
                  <div className="flex items-start gap-6">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#64B37A] to-[#2F6D49] flex items-center justify-center text-white text-2xl font-semibold">
                      {profile.firstName[0]}{profile.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-semibold text-gray-900">{profile.firstName} {profile.lastName}</h2>
                      <p className="text-gray-600">{profile.title}</p>
                      <p className="text-gray-500">{profile.organization}</p>
                    </div>
                    <button className="px-4 py-2 text-sm bg-[#E6F4EA] border border-[#CDEBD8] text-[#0E2A23] rounded-lg hover:brightness-95">
                      Upload Photo
                    </button>
                  </div>

                  <Section title="Personal Information" subtitle="Your basic profile details">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Row label="First name">
                        <input
                          className="h-9 w-full rounded-md border px-3 text-sm"
                          value={profile.firstName}
                          onChange={(e) => saveProfile({ ...profile, firstName: e.target.value })}
                        />
                      </Row>
                      <Row label="Last name">
                        <input
                          className="h-9 w-full rounded-md border px-3 text-sm"
                          value={profile.lastName}
                          onChange={(e) => saveProfile({ ...profile, lastName: e.target.value })}
                        />
                      </Row>
                    </div>
                    <Row label="Email address">
                      <input
                        type="email"
                        className="h-9 w-full rounded-md border px-3 text-sm"
                        value={profile.email}
                        onChange={(e) => saveProfile({ ...profile, email: e.target.value })}
                      />
                    </Row>
                    <Row label="Phone number">
                      <input
                        type="tel"
                        className="h-9 w-full rounded-md border px-3 text-sm"
                        value={profile.phone}
                        onChange={(e) => saveProfile({ ...profile, phone: e.target.value })}
                      />
                    </Row>
                    <Row label="Bio">
                      <textarea
                        className="w-full rounded-md border px-3 py-2 text-sm resize-none"
                        rows={3}
                        value={profile.bio}
                        onChange={(e) => saveProfile({ ...profile, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                      />
                    </Row>
                  </Section>

                  <Section title="Professional Details" subtitle="Work-related information">
                    <Row label="Job title">
                      <input
                        className="h-9 w-full rounded-md border px-3 text-sm"
                        value={profile.title}
                        onChange={(e) => saveProfile({ ...profile, title: e.target.value })}
                      />
                    </Row>
                    <Row label="Organization">
                      <input
                        className="h-9 w-full rounded-md border px-3 text-sm"
                        value={profile.organization}
                        onChange={(e) => saveProfile({ ...profile, organization: e.target.value })}
                      />
                    </Row>
                    <Row label="Department">
                      <input
                        className="h-9 w-full rounded-md border px-3 text-sm"
                        value={profile.department}
                        onChange={(e) => saveProfile({ ...profile, department: e.target.value })}
                      />
                    </Row>
                  </Section>

                  <Section title="Regional Settings" subtitle="Language and location preferences">
                    <Row label="Timezone">
                      <select
                        className="h-9 w-full rounded-md border px-3 text-sm"
                        value={profile.timezone}
                        onChange={(e) => saveProfile({ ...profile, timezone: e.target.value })}
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </Row>
                    <Row label="Language">
                      <select
                        className="h-9 w-full rounded-md border px-3 text-sm"
                        value={profile.language}
                        onChange={(e) => saveProfile({ ...profile, language: e.target.value })}
                      >
                        <option value="en-US">English (US)</option>
                        <option value="en-GB">English (UK)</option>
                        <option value="es-ES">Español</option>
                        <option value="fr-FR">Français</option>
                      </select>
                    </Row>
                  </Section>
                </div>
              )}

              {activeSection === 'preferences' && (
                <div className="space-y-8">
                  <Section title="Dashboard Defaults" subtitle="Set your preferred dashboard experience">
                    <Row label="Default view">
                      <select
                        className="h-9 w-full rounded-md border px-3 text-sm"
                        value={prefs.defaultView}
                        onChange={(e) => savePrefs({ ...prefs, defaultView: e.target.value as any })}
                      >
                        <option value="overview">Project Snapshot</option>
                        <option value="analytics">Survey Insights</option>
                        <option value="reports">Reports</option>
                      </select>
                    </Row>
                    <Row label="Date format">
                      <select
                        className="h-9 w-full rounded-md border px-3 text-sm"
                        value={prefs.dateFormat}
                        onChange={(e) => savePrefs({ ...prefs, dateFormat: e.target.value as any })}
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY (EU)</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                      </select>
                    </Row>
                    <Row label="Auto-refresh data">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#64B37A] rounded"
                          checked={prefs.autoRefresh}
                          onChange={(e) => savePrefs({ ...prefs, autoRefresh: e.target.checked })}
                        />
                        <span className="ml-2 text-sm text-gray-600">Automatically refresh dashboard data</span>
                      </label>
                    </Row>
                    {prefs.autoRefresh && (
                      <Row label="Refresh interval">
                        <select
                          className="h-9 w-full rounded-md border px-3 text-sm"
                          value={prefs.refreshInterval}
                          onChange={(e) => savePrefs({ ...prefs, refreshInterval: parseInt(e.target.value) })}
                        >
                          <option value={60}>1 minute</option>
                          <option value={300}>5 minutes</option>
                          <option value={600}>10 minutes</option>
                          <option value={1800}>30 minutes</option>
                          <option value={3600}>1 hour</option>
                        </select>
                      </Row>
                    )}
                  </Section>

                  <Section title="Theme & Appearance" subtitle="Customize the visual appearance">
                    <Row label="Theme">
                      <select
                        className="h-9 w-full rounded-md border px-3 text-sm"
                        value={prefs.theme}
                        onChange={(e) => savePrefs({ ...prefs, theme: e.target.value as any })}
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto (system preference)</option>
                      </select>
                    </Row>
                    <Row label="Compact UI">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#64B37A] rounded"
                          checked={prefs.compactUI}
                          onChange={(e) => savePrefs({ ...prefs, compactUI: e.target.checked })}
                        />
                        <span className="ml-2 text-sm text-gray-600">Use compact spacing</span>
                      </label>
                    </Row>
                  </Section>

                  <Section title="Charts & Visualizations" subtitle="Configure how data is displayed">
                    <Row label="Default chart type">
                      <select
                        className="h-9 w-full rounded-md border px-3 text-sm"
                        value={prefs.defaultChartType}
                        onChange={(e) => savePrefs({ ...prefs, defaultChartType: e.target.value as any })}
                      >
                        <option value="bar">Bar Charts</option>
                        <option value="line">Line Charts</option>
                        <option value="donut">Donut Charts</option>
                      </select>
                    </Row>
                    <Row label="Show percentages">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#64B37A] rounded"
                          checked={prefs.showPercentages}
                          onChange={(e) => savePrefs({ ...prefs, showPercentages: e.target.checked })}
                        />
                        <span className="ml-2 text-sm text-gray-600">Display percentages on charts</span>
                      </label>
                    </Row>
                    <Row label="Show gridlines">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#64B37A] rounded"
                          checked={prefs.showGridlines}
                          onChange={(e) => savePrefs({ ...prefs, showGridlines: e.target.checked })}
                        />
                        <span className="ml-2 text-sm text-gray-600">Show chart gridlines</span>
                      </label>
                    </Row>
                    <Row label="Animate charts">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#64B37A] rounded"
                          checked={prefs.animateCharts}
                          onChange={(e) => savePrefs({ ...prefs, animateCharts: e.target.checked })}
                        />
                        <span className="ml-2 text-sm text-gray-600">Enable chart animations</span>
                      </label>
                    </Row>
                  </Section>

                  <Section title="Brand Colors" subtitle="Customize your dashboard brand colors">
                    <Row label="Primary gradient — From">
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          className="h-9 w-12 rounded border"
                          value={prefs.primaryFrom}
                          onChange={(e) => savePrefs({ ...prefs, primaryFrom: e.target.value })}
                        />
                        <input
                          className="h-9 w-full rounded-md border px-3 text-sm"
                          value={prefs.primaryFrom}
                          onChange={(e) => savePrefs({ ...prefs, primaryFrom: e.target.value })}
                        />
                      </div>
                    </Row>
                    <Row label="Primary gradient — To">
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          className="h-9 w-12 rounded border"
                          value={prefs.primaryTo}
                          onChange={(e) => savePrefs({ ...prefs, primaryTo: e.target.value })}
                        />
                        <input
                          className="h-9 w-full rounded-md border px-3 text-sm"
                          value={prefs.primaryTo}
                          onChange={(e) => savePrefs({ ...prefs, primaryTo: e.target.value })}
                        />
                      </div>
                    </Row>
                    <div className="grid sm:grid-cols-[200px_1fr] items-start gap-2">
                      <div className="text-sm font-medium text-gray-800 pt-2">Preview</div>
                      <div className="rounded-lg border p-4">
                        <div
                          className="rounded-md px-4 py-2 text-white w-fit"
                          style={{
                            background: `linear-gradient(90deg, ${prefs.primaryFrom} 0%, ${prefs.primaryTo} 100%)`,
                          }}
                        >
                          Primary Button
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                          Saved {savedAt ? `at ${savedAt}` : "locally"}.
                        </p>
                      </div>
                    </div>
                  </Section>

                  <Section title="Data Export" subtitle="Configure default export preferences">
                    <Row label="Default export format">
                      <select
                        className="h-9 w-full rounded-md border px-3 text-sm"
                        value={prefs.exportFormat}
                        onChange={(e) => savePrefs({ ...prefs, exportFormat: e.target.value as any })}
                      >
                        <option value="csv">CSV (Spreadsheet)</option>
                        <option value="json">JSON (Raw Data)</option>
                        <option value="pdf">PDF (Report)</option>
                      </select>
                    </Row>
                    <Row label="Data retention period">
                      <select
                        className="h-9 w-full rounded-md border px-3 text-sm"
                        value={prefs.dataRetention}
                        onChange={(e) => savePrefs({ ...prefs, dataRetention: parseInt(e.target.value) })}
                      >
                        <option value={30}>30 days</option>
                        <option value={90}>90 days</option>
                        <option value={180}>6 months</option>
                        <option value={365}>1 year</option>
                        <option value={730}>2 years</option>
                        <option value={-1}>Forever</option>
                      </select>
                    </Row>
                  </Section>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="space-y-8">
                  <Section title="Email Notifications" subtitle="Configure automated email communications">
                    <Row label="Email reports">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#64B37A] rounded"
                          checked={notifications.emailReports}
                          onChange={(e) => saveNotifications({ ...notifications, emailReports: e.target.checked })}
                        />
                        <span className="ml-2 text-sm text-gray-600">Receive automated dashboard reports</span>
                      </label>
                    </Row>
                    <Row label="Report frequency">
                      <select
                        className="h-9 w-full rounded-md border px-3 text-sm"
                        value={notifications.reportFrequency}
                        onChange={(e) => saveNotifications({ ...notifications, reportFrequency: e.target.value as any })}
                        disabled={!notifications.emailReports}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </Row>
                    <Row label="Weekly digest">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#64B37A] rounded"
                          checked={notifications.weeklyDigest}
                          onChange={(e) => saveNotifications({ ...notifications, weeklyDigest: e.target.checked })}
                        />
                        <span className="ml-2 text-sm text-gray-600">Weekly summary of key insights</span>
                      </label>
                    </Row>
                  </Section>

                  <Section title="Data Alerts" subtitle="Get notified about important changes">
                    <Row label="Data alerts">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#64B37A] rounded"
                          checked={notifications.dataAlerts}
                          onChange={(e) => saveNotifications({ ...notifications, dataAlerts: e.target.checked })}
                        />
                        <span className="ml-2 text-sm text-gray-600">Alert when metrics change significantly</span>
                      </label>
                    </Row>
                    <Row label="Alert threshold">
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="5"
                          max="50"
                          step="5"
                          className="flex-1"
                          value={notifications.alertThreshold}
                          onChange={(e) => saveNotifications({ ...notifications, alertThreshold: parseInt(e.target.value) })}
                          disabled={!notifications.dataAlerts}
                        />
                        <span className="text-sm text-gray-600 w-12">{notifications.alertThreshold}%</span>
                      </div>
                    </Row>
                  </Section>

                  <Section title="Communication Preferences" subtitle="Choose how you want to be contacted">
                    <Row label="Push notifications">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#64B37A] rounded"
                          checked={notifications.pushNotifications}
                          onChange={(e) => saveNotifications({ ...notifications, pushNotifications: e.target.checked })}
                        />
                        <span className="ml-2 text-sm text-gray-600">Browser push notifications</span>
                      </label>
                    </Row>
                    <Row label="SMS alerts">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#64B37A] rounded"
                          checked={notifications.smsAlerts}
                          onChange={(e) => saveNotifications({ ...notifications, smsAlerts: e.target.checked })}
                        />
                        <span className="ml-2 text-sm text-gray-600">Text message alerts for critical updates</span>
                      </label>
                    </Row>
                    <Row label="System updates">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#64B37A] rounded"
                          checked={notifications.systemUpdates}
                          onChange={(e) => saveNotifications({ ...notifications, systemUpdates: e.target.checked })}
                        />
                        <span className="ml-2 text-sm text-gray-600">Platform updates and new features</span>
                      </label>
                    </Row>
                  </Section>
                </div>
              )}

              {activeSection === 'billing' && (
                <div className="space-y-8">
                  <Section title="Current Plan" subtitle="Your subscription details and usage">
                    <div className="rounded-lg border p-4 bg-[#E6F4EA]">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-[#0E2A23]">
                            {billing.plan === 'essential' ? 'Essential Plan' : 
                             billing.plan === 'professional' ? 'Professional Plan' : 
                             billing.plan === 'warren-suite' ? 'Warren Suite Premium' : 
                             'Enterprise Plan'}
                          </h3>
                          <p className="text-sm text-gray-600">Billed {billing.billingCycle}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-[#0E2A23]">
                            {billing.plan === 'essential' ? 
                              (billing.billingCycle === 'monthly' ? '$299' : '$2,990') : 
                             billing.plan === 'professional' ? 
                              (billing.billingCycle === 'monthly' ? '$899' : '$8,990') : 
                             billing.plan === 'warren-suite' ? 
                              (billing.billingCycle === 'monthly' ? '$2,499' : '$24,990') : 
                              'Custom'}
                            <span className="text-sm font-normal">
                              {billing.plan === 'enterprise' ? '' : `/${billing.billingCycle === 'monthly' ? 'mo' : 'yr'}`}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">Next billing: {new Date(billing.nextBilling).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">
                          {billing.plan === 'essential' ? 'Basic survey creation and analytics for growing organizations.' : 
                           billing.plan === 'professional' ? 'Advanced analytics and insights for established teams.' : 
                           billing.plan === 'warren-suite' ? 'Complete research platform with unlimited participants, automated analysis, and strategic reporting.' : 
                           'Custom solution with white-label options and dedicated support.'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-xs bg-white border border-[#CDEBD8] text-[#0E2A23] rounded-md hover:brightness-95">
                          Change Plan
                        </button>
                        <button className="px-3 py-1 text-xs bg-white border border-[#CDEBD8] text-[#0E2A23] rounded-md hover:brightness-95">
                          View Usage
                        </button>
                      </div>
                    </div>
                  </Section>
                  
                  <Section title="Available Plans" subtitle="Compare features and choose the right plan for your organization">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                      {/* Essential Plan */}
                      <div className={`rounded-lg border p-4 ${billing.plan === 'essential' ? 'border-[#64B37A] bg-[#E6F4EA]' : 'border-gray-200 bg-white'}`}>
                        <div className="text-center">
                          <h4 className="font-semibold text-gray-900">Essential</h4>
                          <div className="mt-2">
                            <span className="text-2xl font-bold text-gray-900">$299</span>
                            <span className="text-gray-600">/month</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">$2,990/year (save 17%)</div>
                        </div>
                        <ul className="text-sm text-gray-600 mt-4 space-y-2">
                          <li>• Up to 1,000 responses/month</li>
                          <li>• Basic survey templates</li>
                          <li>• Standard analytics</li>
                          <li>• Email support</li>
                          <li>• Data export (CSV, PDF)</li>
                        </ul>
                      </div>

                      {/* Professional Plan */}
                      <div className={`rounded-lg border p-4 ${billing.plan === 'professional' ? 'border-[#64B37A] bg-[#E6F4EA]' : 'border-gray-200 bg-white'}`}>
                        <div className="text-center">
                          <h4 className="font-semibold text-gray-900">Professional</h4>
                          <div className="mt-2">
                            <span className="text-2xl font-bold text-gray-900">$899</span>
                            <span className="text-gray-600">/month</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">$8,990/year (save 17%)</div>
                        </div>
                        <ul className="text-sm text-gray-600 mt-4 space-y-2">
                          <li>• Up to 5,000 responses/month</li>
                          <li>• Advanced question types</li>
                          <li>• Statistical analysis</li>
                          <li>• Interactive reporting dashboard</li>
                          <li>• Priority support</li>
                          <li>• Custom branding</li>
                          <li>• API access</li>
                        </ul>
                      </div>

                      {/* Warren Suite Premium */}
                      <div className={`rounded-lg border-2 p-4 relative ${billing.plan === 'warren-suite' ? 'border-[#64B37A] bg-[#E6F4EA]' : 'border-[#64B37A] bg-gradient-to-br from-[#E6F4EA] to-white'}`}>
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-[#64B37A] text-white text-xs px-3 py-1 rounded-full">Most Popular</span>
                        </div>
                        <div className="text-center">
                          <h4 className="font-semibold text-gray-900">Warren Suite Premium</h4>
                          <div className="mt-2">
                            <span className="text-2xl font-bold text-gray-900">$2,499</span>
                            <span className="text-gray-600">/month</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">$24,990/year (save 17%)</div>
                        </div>
                        <ul className="text-sm text-gray-600 mt-4 space-y-2">
                          <li>• <strong>Unlimited participants</strong></li>
                          <li>• <strong>Automated strategic analysis</strong></li>
                          <li>• <strong>Executive memo generation</strong></li>
                          <li>• Project objective development</li>
                          <li>• Advanced question builder</li>
                          <li>• Real-time analytics dashboard</li>
                          <li>• Interactive reporting dashboard</li>
                          <li>• Community demographic insights</li>
                          <li>• Dedicated success manager</li>
                          <li>• White-label options available</li>
                        </ul>
                      </div>

                      {/* Enterprise Plan */}
                      <div className={`rounded-lg border p-4 ${billing.plan === 'enterprise' ? 'border-[#64B37A] bg-[#E6F4EA]' : 'border-gray-200 bg-white'}`}>
                        <div className="text-center">
                          <h4 className="font-semibold text-gray-900">Enterprise</h4>
                          <div className="mt-2">
                            <span className="text-2xl font-bold text-gray-900">Custom</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">Volume pricing available</div>
                        </div>
                        <ul className="text-sm text-gray-600 mt-4 space-y-2">
                          <li>• Everything in Warren Suite</li>
                          <li>• <strong>Community Intelligence</strong></li>
                          <li>• RFP-ready documentation</li>
                          <li>• Custom integrations</li>
                          <li>• On-premise deployment</li>
                          <li>• 24/7 phone support</li>
                          <li>• Training & onboarding</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-[#E6F4EA] to-[#F0F8F4] rounded-lg p-6 mt-6">
                      <h4 className="font-semibold text-[#0E2A23] mb-3">Why Warren Suite Premium?</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                        <div>
                          <h5 className="font-medium text-[#0E2A23] mb-2">Complete Research Platform</h5>
                          <p>From project conception to strategic recommendations - handle every phase of your research with one integrated platform.</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-[#0E2A23] mb-2">Intelligent Insights</h5>
                          <p>Automatically generate strategic memos, identify patterns, and receive actionable recommendations through advanced analytics.</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-[#0E2A23] mb-2">Unlimited Scale</h5>
                          <p>Deploy to unlimited participants, analyze unlimited data, and scale your research without usage restrictions.</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-[#0E2A23] mb-2">Enterprise-Grade Security</h5>
                          <p>SOC 2 compliant, encrypted data storage, and comprehensive audit trails for sensitive organizational research.</p>
                        </div>
                      </div>
                    </div>
                  </Section>

                  <Section title="Payment Method" subtitle="How you pay for your subscription">
                    <Row label="Payment method">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 text-sm text-gray-700">{billing.paymentMethod}</div>
                        <button className="px-3 py-1 text-xs bg-[#E6F4EA] border border-[#CDEBD8] text-[#0E2A23] rounded-md hover:brightness-95">
                          Update
                        </button>
                      </div>
                    </Row>
                    <Row label="Billing email">
                      <input
                        type="email"
                        className="h-9 w-full rounded-md border px-3 text-sm"
                        value={billing.billingEmail}
                        onChange={(e) => saveBilling({ ...billing, billingEmail: e.target.value })}
                      />
                    </Row>
                  </Section>

                  <Section title="Billing Information" subtitle="Company details for invoices">
                    <Row label="Company name">
                      <input
                        className="h-9 w-full rounded-md border px-3 text-sm"
                        value={billing.companyName}
                        onChange={(e) => saveBilling({ ...billing, companyName: e.target.value })}
                      />
                    </Row>
                    <Row label="Tax ID">
                      <input
                        className="h-9 w-full rounded-md border px-3 text-sm"
                        value={billing.taxId}
                        onChange={(e) => saveBilling({ ...billing, taxId: e.target.value })}
                        placeholder="Tax identification number"
                      />
                    </Row>
                    <Row label="Billing address">
                      <div className="space-y-3">
                        <input
                          className="h-9 w-full rounded-md border px-3 text-sm"
                          value={billing.address.street}
                          onChange={(e) => saveBilling({ ...billing, address: { ...billing.address, street: e.target.value } })}
                          placeholder="Street address"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            className="h-9 w-full rounded-md border px-3 text-sm"
                            value={billing.address.city}
                            onChange={(e) => saveBilling({ ...billing, address: { ...billing.address, city: e.target.value } })}
                            placeholder="City"
                          />
                          <input
                            className="h-9 w-full rounded-md border px-3 text-sm"
                            value={billing.address.state}
                            onChange={(e) => saveBilling({ ...billing, address: { ...billing.address, state: e.target.value } })}
                            placeholder="State"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            className="h-9 w-full rounded-md border px-3 text-sm"
                            value={billing.address.zip}
                            onChange={(e) => saveBilling({ ...billing, address: { ...billing.address, zip: e.target.value } })}
                            placeholder="ZIP code"
                          />
                          <input
                            className="h-9 w-full rounded-md border px-3 text-sm"
                            value={billing.address.country}
                            onChange={(e) => saveBilling({ ...billing, address: { ...billing.address, country: e.target.value } })}
                            placeholder="Country"
                          />
                        </div>
                      </div>
                    </Row>
                  </Section>
                </div>
              )}

              {activeSection === 'security' && (
                <div className="space-y-8">
                  <Section title="Authentication" subtitle="Control how you sign in and stay signed in">
                    <Row label="Multi-factor authentication">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-[#64B37A] rounded"
                            checked={security.requireMFA}
                            onChange={(e) => saveSecurity({ ...security, requireMFA: e.target.checked })}
                          />
                          <span className="ml-2 text-sm text-gray-600">Require MFA for sign-in</span>
                        </label>
                        {security.requireMFA && (
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Enabled</span>
                        )}
                      </div>
                    </Row>
                    <Row label="Session timeout">
                      <select
                        className="h-9 w-full rounded-md border px-3 text-sm"
                        value={security.sessionTimeout}
                        onChange={(e) => saveSecurity({ ...security, sessionTimeout: parseInt(e.target.value) })}
                      >
                        <option value={60}>1 hour</option>
                        <option value={240}>4 hours</option>
                        <option value={480}>8 hours</option>
                        <option value={720}>12 hours</option>
                        <option value={1440}>24 hours</option>
                      </select>
                    </Row>
                    <Row label="Login notifications">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#64B37A] rounded"
                          checked={security.loginNotifications}
                          onChange={(e) => saveSecurity({ ...security, loginNotifications: e.target.checked })}
                        />
                        <span className="ml-2 text-sm text-gray-600">Email me when I sign in from a new device</span>
                      </label>
                    </Row>
                  </Section>

                  <Section title="Data & Privacy" subtitle="Control your data access and sharing">
                    <Row label="Data export permissions">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#64B37A] rounded"
                          checked={security.allowDataExport}
                          onChange={(e) => saveSecurity({ ...security, allowDataExport: e.target.checked })}
                        />
                        <span className="ml-2 text-sm text-gray-600">Allow downloading of dashboard data</span>
                      </label>
                    </Row>
                    <Row label="Usage analytics">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#64B37A] rounded"
                          checked={security.shareAnalytics}
                          onChange={(e) => saveSecurity({ ...security, shareAnalytics: e.target.checked })}
                        />
                        <span className="ml-2 text-sm text-gray-600">Share anonymous usage data to improve Warren</span>
                      </label>
                    </Row>
                    <Row label="Activity logging">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#64B37A] rounded"
                          checked={security.logActivity}
                          onChange={(e) => saveSecurity({ ...security, logActivity: e.target.checked })}
                        />
                        <span className="ml-2 text-sm text-gray-600">Log my activity for security monitoring</span>
                      </label>
                    </Row>
                  </Section>

                  <Section title="API Access" subtitle="Control programmatic access to your data">
                    <Row label="API access">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-[#64B37A] rounded"
                            checked={security.apiAccess}
                            onChange={(e) => saveSecurity({ ...security, apiAccess: e.target.checked })}
                          />
                          <span className="ml-2 text-sm text-gray-600">Enable API access</span>
                        </label>
                        {security.apiAccess && (
                          <button className="px-3 py-1 text-xs bg-[#E6F4EA] border border-[#CDEBD8] text-[#0E2A23] rounded-md hover:brightness-95">
                            Manage Keys
                          </button>
                        )}
                      </div>
                    </Row>
                  </Section>
                </div>
              )}
            </div>

            {/* Footer with save status */}
            <div className="border-t bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {savedAt ? `Last saved at ${savedAt}` : 'Settings auto-save locally'}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={resetDefaults}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Reset all to defaults
                  </button>
                  <button
                    onClick={downloadJSON}
                    className="rounded-full border px-4 py-2 text-sm bg-[#E6F4EA] border-[#CDEBD8] text-[#0E2A23] hover:brightness-95 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export All Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}