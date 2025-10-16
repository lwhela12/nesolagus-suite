'use client'

import { ArrowRight, BarChart3, Users, TrendingUp, Shield, Zap, Eye } from 'lucide-react'
import Link from 'next/link'

export default function SplashPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F7F6] via-white to-[#F0F8F4]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#64B37A] to-[#2F6D49] flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Warren Hollow</h1>
                <p className="text-xs text-gray-500">Analytics Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <img 
                src="/logos/nesolagus-bug.png" 
                alt="Nesolagus" 
                className="h-8 w-8"
              />
              <span className="text-sm font-medium text-gray-700">Nesolagus</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Community Intelligence
            <span className="block text-[#64B37A]">Dashboard</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transforming community feedback into actionable insights.
          </p>
          
          <div className="flex justify-center">
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#64B37A] to-[#2F6D49] text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105"
            >
              <BarChart3 className="h-5 w-5" />
              View Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>


        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 bg-gradient-to-br from-[#64B37A] to-[#2F6D49] rounded-xl flex items-center justify-center mb-6">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-Time Analytics</h3>
            <p className="text-gray-600 mb-6">
              Live dashboard with survey metrics, completion rates, and demographic insights. 
              Track community engagement as it happens.
            </p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#64B37A] font-medium hover:gap-3 transition-all">
              View Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 bg-gradient-to-br from-[#86C99B] to-[#64B37A] rounded-xl flex items-center justify-center mb-6">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Narrative Analysis</h3>
            <p className="text-gray-600 mb-6">
              AI-powered thematic analysis of community stories with sentiment tracking 
              and key insight extraction from 50+ narrative responses.
            </p>
            <Link href="/analytics?tab=stories" className="inline-flex items-center gap-2 text-[#64B37A] font-medium hover:gap-3 transition-all">
              Explore Stories <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 bg-gradient-to-br from-[#A9D8B7] to-[#86C99B] rounded-xl flex items-center justify-center mb-6">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Strategic Intelligence</h3>
            <p className="text-gray-600 mb-6">
              Comprehensive reports with strategic recommendations, industry context, 
              and actionable insights for organizational decision-making.
            </p>
            <Link href="/strategic-plan" className="inline-flex items-center gap-2 text-[#64B37A] font-medium hover:gap-3 transition-all">
              View Strategy <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Analytics Suite</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Six comprehensive sections providing deep insights into community engagement, 
              survey performance, and strategic opportunities.
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { label: 'Project Snapshot', href: '/dashboard', icon: BarChart3, color: 'from-[#64B37A] to-[#2F6D49]' },
              { label: 'Survey Insights', href: '/analytics', icon: Eye, color: 'from-[#86C99B] to-[#64B37A]' },
              { label: 'Community Pulse', href: '/community-pulse', icon: Users, color: 'from-[#A9D8B7] to-[#86C99B]' },
              { label: 'Strategic Plan', href: '/strategic-plan', icon: TrendingUp, color: 'from-[#DAEDF0] to-[#A9D8B7]' },
              { label: 'Reports', href: '/reports', icon: Shield, color: 'from-[#B8E6C1] to-[#86C99B]' },
              { label: 'Settings', href: '/settings', icon: Zap, color: 'from-[#9DD9A3] to-[#64B37A]' },
            ].map((section, idx) => {
              const Icon = section.icon;
              return (
                <Link
                  key={section.label}
                  href={section.href}
                  className="group p-4 rounded-xl border border-gray-200 hover:border-[#64B37A] hover:shadow-md transition-all text-center"
                >
                  <div className={`h-10 w-10 bg-gradient-to-br ${section.color} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-sm font-medium text-gray-900 group-hover:text-[#64B37A]">{section.label}</div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Security & Trust */}
        <div className="bg-gradient-to-r from-[#E6F4EA] to-[#F0F8F4] rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-6 w-6 text-[#64B37A]" />
            <span className="text-lg font-semibold text-[#0E2A23]">Enterprise Security</span>
          </div>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Warren follows SOC 2 equivalent controls with 256-bit encryption, zero data sales, 
            and full GDPR/COPPA/FERPA compliance. Your community data stays secure and private.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <span>• 256-bit Encryption</span>
            <span>• Zero Data Sales</span>
            <span>• Privacy by Design</span>
            <span>• GDPR Compliant</span>
            <span>• Export Rights</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-[#64B37A] to-[#2F6D49] flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm text-gray-600">Warren Hollow Analytics Dashboard</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>© 2025 Warren Analytics • Powered by</span>
              <img 
                src="/logos/nesolagus-bug.png" 
                alt="Nesolagus" 
                className="h-4 w-4"
              />
              <span>Nesolagus</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}