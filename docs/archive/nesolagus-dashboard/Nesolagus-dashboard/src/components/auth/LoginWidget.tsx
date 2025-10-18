'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface LoginWidgetProps {
  /**
   * The path to redirect to after successful login
   * @default "/"
   */
  redirectPath?: string
  /**
   * Optional callback function when sign in button is clicked
   */
  onSignIn?: (email: string, password: string) => void | Promise<void>
  /**
   * Custom title to display above the form
   * @default "Welcome to Nesolagus"
   */
  title?: string
  /**
   * Custom subtitle to display below the title
   * @default "Transform community insights into strategic action"
   */
  subtitle?: string
  /**
   * Path to the logo image
   * @default "/logos/nesolagus-bug.png"
   */
  logoPath?: string
  /**
   * Alt text for the logo
   * @default "Nesolagus"
   */
  logoAlt?: string
  /**
   * Show or hide the footer text
   * @default true
   */
  showFooter?: boolean
  /**
   * Custom footer text
   * @default "Secure access to your community intelligence dashboard"
   */
  footerText?: string
}

/**
 * Reusable login widget component for Nesolagus monorepo
 *
 * Features:
 * - Centered card design with logo
 * - Email and password inputs
 * - Customizable redirect path
 * - Optional callback for custom authentication logic
 * - Fully customizable text and branding
 *
 * @example
 * ```tsx
 * // Basic usage
 * <LoginWidget />
 *
 * // With custom redirect
 * <LoginWidget redirectPath="/dashboard" />
 *
 * // With custom authentication
 * <LoginWidget
 *   onSignIn={async (email, password) => {
 *     await authenticate(email, password)
 *   }}
 * />
 *
 * // Fully customized
 * <LoginWidget
 *   title="Welcome Back"
 *   subtitle="Sign in to continue"
 *   logoPath="/custom-logo.png"
 *   footerText="Powered by Nesolagus"
 * />
 * ```
 */
export default function LoginWidget({
  redirectPath = '/',
  onSignIn,
  title = 'Welcome to Nesolagus',
  subtitle = 'Transform community insights into strategic action',
  logoPath = '/logos/nesolagus-bug.png',
  logoAlt = 'Nesolagus',
  showFooter = true,
  footerText = 'Secure access to your community intelligence dashboard',
}: LoginWidgetProps) {
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (onSignIn) {
      await onSignIn(email, password)
    }
  }

  const SignInButton = onSignIn ? 'button' : Link

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-2xl p-10">
        <div className="text-center mb-8">
          <div className="relative h-24 w-24 mx-auto mb-6">
            <Image
              src={logoPath}
              alt={logoAlt}
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {title}
          </h1>
          <p className="text-gray-600 leading-relaxed">
            {subtitle}
          </p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#64B37A] focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#64B37A] focus:border-transparent transition-all"
            />
          </div>
          <SignInButton
            {...(onSignIn ? { type: 'submit' } : { href: redirectPath })}
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#64B37A] to-[#2F6D49] text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105"
          >
            Sign In
            <ArrowRight className="h-4 w-4" />
          </SignInButton>
        </form>

        {showFooter && (
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>{footerText}</p>
          </div>
        )}
      </div>
    </div>
  )
}
