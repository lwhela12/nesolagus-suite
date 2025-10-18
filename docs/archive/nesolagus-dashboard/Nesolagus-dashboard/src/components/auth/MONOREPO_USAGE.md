# Using LoginWidget Across the Nesolagus Monorepo

This guide explains how to use the LoginWidget component across different tools and repositories in the Nesolagus monorepo.

## Quick Start

### Option 1: Copy Files (Recommended for Independent Repos)

1. Copy these files to your project:
   ```
   src/components/auth/
   ├── LoginWidget.tsx
   ├── index.ts
   └── README.md
   ```

2. Ensure dependencies are installed:
   ```bash
   npm install lucide-react
   # or
   yarn add lucide-react
   ```

3. Import and use:
   ```tsx
   import { LoginWidget } from '@/components/auth'

   export default function LoginPage() {
     return <LoginWidget />
   }
   ```

### Option 2: Shared Package (For Tightly Coupled Monorepo)

If you're using a tool like Turborepo or Nx with shared packages:

1. Create a shared UI package:
   ```
   packages/ui/
   ├── components/
   │   └── LoginWidget.tsx
   └── package.json
   ```

2. Import from the shared package:
   ```tsx
   import { LoginWidget } from '@nesolagus/ui'
   ```

## Common Use Cases

### Standalone Login Page

```tsx
// app/login/page.tsx
import { LoginWidget } from '@/components/auth'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F7F7F6] via-white to-[#F0F8F4]">
      <LoginWidget redirectPath="/dashboard" />
    </div>
  )
}
```

### With Custom Authentication (NextAuth)

```tsx
// app/login/page.tsx
'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LoginWidget } from '@/components/auth'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F7F7F6] via-white to-[#F0F8F4]">
      <LoginWidget
        onSignIn={async (email, password) => {
          const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
          })

          if (result?.ok) {
            router.push('/dashboard')
          } else {
            setError('Invalid credentials')
          }
        }}
      />
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  )
}
```

### Custom Branding for Different Tools

```tsx
// Tool-specific login
import { LoginWidget } from '@/components/auth'

// Analytics Tool
export function AnalyticsLogin() {
  return (
    <LoginWidget
      title="Analytics Dashboard"
      subtitle="Sign in to view your community insights"
      logoPath="/logos/analytics-logo.png"
    />
  )
}

// Survey Tool
export function SurveyLogin() {
  return (
    <LoginWidget
      title="Survey Builder"
      subtitle="Create and manage your surveys"
      logoPath="/logos/survey-logo.png"
    />
  )
}
```

## Tailwind Configuration

Ensure your `tailwind.config.js` includes the Nesolagus color scheme:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        nesolagus: {
          primary: '#64B37A',
          dark: '#2F6D49',
          light: '#86C99B',
        }
      }
    }
  }
}
```

Or keep using the hex values directly as in the component.

## Version Synchronization

To keep the LoginWidget consistent across repos:

### 1. Version Tagging
Tag versions in the main repo:
```bash
git tag components/auth/v1.0.0
git push origin components/auth/v1.0.0
```

### 2. Update Documentation
When making changes, update:
- Component version in README
- Changelog of modifications
- Migration notes if breaking changes

### 3. Notify Teams
When updating the component:
1. Document the changes
2. Create a migration guide if needed
3. Notify other tool maintainers
4. Update all instances in the monorepo

## File Structure in Different Tools

```
# Nesolagus Dashboard (Source of Truth)
nesolagus-dashboard/
└── src/
    └── components/
        └── auth/
            ├── LoginWidget.tsx
            ├── index.ts
            ├── README.md
            └── MONOREPO_USAGE.md

# Analytics Tool
nesolagus-analytics/
└── src/
    └── components/
        └── auth/
            ├── LoginWidget.tsx
            └── index.ts

# Survey Tool
nesolagus-survey/
└── src/
    └── components/
        └── auth/
            ├── LoginWidget.tsx
            └── index.ts
```

## Customization Guidelines

### DO:
- ✅ Customize text props (title, subtitle, footerText)
- ✅ Use different logos per tool
- ✅ Wrap in custom layouts
- ✅ Add tool-specific authentication logic
- ✅ Extend with additional features (forgot password, etc.)

### DON'T:
- ❌ Modify core component structure without syncing
- ❌ Change color scheme drastically (maintain brand consistency)
- ❌ Remove accessibility features
- ❌ Break responsive design

## Testing Checklist

When using in a new tool:
- [ ] Component renders correctly
- [ ] Form submission works
- [ ] Authentication flow completes
- [ ] Responsive design works (mobile/tablet/desktop)
- [ ] Keyboard navigation works
- [ ] Logo loads correctly
- [ ] Colors match Nesolagus brand
- [ ] Error states handled appropriately

## Support & Updates

**Source Repository:** `nesolagus-dashboard`
**Component Location:** `src/components/auth/LoginWidget.tsx`
**Maintainer:** Nesolagus Core Team

For updates or issues:
1. Check the source repository for latest version
2. Review changelog for breaking changes
3. Test in your environment before deploying
4. Report issues to the core team

## Example Repositories

See these examples for reference:
- `nesolagus-dashboard` - Main dashboard implementation
- `nesolagus-analytics` - Custom auth integration (coming soon)
- `nesolagus-survey` - Supabase integration (coming soon)
