'use client'

import { TrendingUp, Shield } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import LoginWidget from '@/components/auth/LoginWidget'

export default function SplashPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F7F6] via-white to-[#F0F8F4]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12">
                <Image
                  src="/logos/ghac-logo-bug.png"
                  alt="GHAC"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="h-8 w-px bg-gray-300" />
              <div className="relative h-8 w-8">
                <Image
                  src="/logos/nesolagus-bug.png"
                  alt="Nesolagus"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-[#64B37A] transition-colors"
            >
              Enter Dashboard →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section - Login Widget */}
        <div className="mb-20">
          <LoginWidget redirectPath="/" />
        </div>

        {/* Why This Matters - Enhanced Flashy Version */}
        <div className="relative bg-gradient-to-br from-[#64B37A] via-[#2F6D49] to-[#1A4D2E] rounded-3xl p-16 mb-20 text-white overflow-hidden shadow-2xl">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>

          <div className="relative max-w-5xl mx-auto text-center">
            <div className="inline-block mb-6 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full border-2 border-white/30">
              <span className="text-sm font-bold tracking-wider uppercase">From Extraction to Partnership</span>
            </div>

            <h2 className="text-4xl lg:text-6xl font-black mb-8 leading-tight">
              A New Way to Build Together
            </h2>

            <p className="text-xl lg:text-2xl mb-12 leading-relaxed text-white/95 font-light max-w-4xl mx-auto">
              Traditional methods extract data from communities. We create space for <span className="font-bold text-white border-b-2 border-white/50">authentic dialogue</span> where participants aren't just heard—they actively shape the questions, influence the outcomes, and <span className="font-bold text-white border-b-2 border-white/50">co-create the future</span>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md rounded-2xl p-8 border-2 border-white/30 hover:scale-105 transition-transform duration-300 shadow-xl">
                <div className="text-5xl font-black mb-3 text-white drop-shadow-lg">Voice</div>
                <div className="text-lg font-semibold mb-2">Real Participation</div>
                <div className="text-sm text-white/90">Moving beyond surveys to meaningful co-design conversations</div>
              </div>

              <div className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md rounded-2xl p-8 border-2 border-white/30 hover:scale-105 transition-transform duration-300 shadow-xl">
                <div className="text-5xl font-black mb-3 text-white drop-shadow-lg">Power</div>
                <div className="text-lg font-semibold mb-2">Shared Decision-Making</div>
                <div className="text-sm text-white/90">Participants shape outcomes, not just provide feedback</div>
              </div>

              <div className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md rounded-2xl p-8 border-2 border-white/30 hover:scale-105 transition-transform duration-300 shadow-xl">
                <div className="text-5xl font-black mb-3 text-white drop-shadow-lg">
                  <TrendingUp className="h-16 w-16 mx-auto" />
                </div>
                <div className="text-lg font-semibold mb-2">Lasting Impact</div>
                <div className="text-sm text-white/90">Building trust through genuine partnership and ownership</div>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Privacy - Enhanced Prominent Version */}
        <div className="bg-gradient-to-br from-[#E6F4EA] via-[#F0F8F4] to-[#E6F4EA] rounded-3xl p-12 border-2 border-[#64B37A]/30 shadow-xl">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-[#64B37A] to-[#2F6D49] p-4 rounded-2xl shadow-lg">
                  <Shield className="h-10 w-10 text-white" />
                </div>
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold text-[#0E2A23] mb-6">
                Your Data. Your Control. Your Privacy.
              </h2>
              <p className="text-xl text-gray-700 mb-4 leading-relaxed font-medium">
                Nesolagus is built on a foundation of <span className="text-[#64B37A] font-bold">data ownership</span>, <span className="text-[#64B37A] font-bold">privacy protection</span>, and <span className="text-[#64B37A] font-bold">security excellence</span>.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                We follow SOC 2 equivalent controls with enterprise-grade 256-bit encryption, zero data sales,
                and full GDPR/COPPA/FERPA compliance. Your community data stays secure, private, and under your complete control—always.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 border-2 border-[#64B37A]/20 hover:border-[#64B37A] transition-all shadow-md">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="h-6 w-6 text-[#64B37A]" />
                  <span className="font-bold text-gray-900">Data Ownership</span>
                </div>
                <p className="text-sm text-gray-600">Your data belongs to you. Full export rights and complete control over your information.</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-[#64B37A]/20 hover:border-[#64B37A] transition-all shadow-md">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="h-6 w-6 text-[#64B37A]" />
                  <span className="font-bold text-gray-900">Privacy Protection</span>
                </div>
                <p className="text-sm text-gray-600">Zero data sales. Privacy by design. Your community's trust is protected.</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-[#64B37A]/20 hover:border-[#64B37A] transition-all shadow-md">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="h-6 w-6 text-[#64B37A]" />
                  <span className="font-bold text-gray-900">Enterprise Security</span>
                </div>
                <p className="text-sm text-gray-600">256-bit encryption, SOC 2 controls, and full regulatory compliance.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200">
                <Shield className="h-4 w-4 text-[#64B37A]" />
                <span>256-bit Encryption</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200">
                <Shield className="h-4 w-4 text-[#64B37A]" />
                <span>Zero Data Sales</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200">
                <Shield className="h-4 w-4 text-[#64B37A]" />
                <span>Privacy by Design</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200">
                <Shield className="h-4 w-4 text-[#64B37A]" />
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200">
                <Shield className="h-4 w-4 text-[#64B37A]" />
                <span>Full Data Ownership</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8">
                <Image
                  src="/logos/ghac-logo-bug.png"
                  alt="GHAC Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Greater Hartford Arts Council</div>
                <div className="text-xs text-gray-500">Community Intelligence Dashboard</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>© 2025 GHAC • Analytics powered by</span>
              <div className="relative h-5 w-5">
                <Image
                  src="/logos/nesolagus-bug.png"
                  alt="Nesolagus"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-medium text-gray-700">Nesolagus</span>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
            <p>Survey conducted October 2025 • Data updated in real-time</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
