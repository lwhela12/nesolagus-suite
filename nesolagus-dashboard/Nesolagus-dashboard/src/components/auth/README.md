# LoginWidget Component

A reusable, customizable login component for the Nesolagus monorepo. This component provides a beautiful, consistent login experience across all Nesolagus tools and applications.

## Features

- Clean, centered card design with logo
- Email and password input fields with validation
- Customizable branding (logo, title, subtitle)
- Flexible redirect or callback-based authentication
- Fully typed with TypeScript
- Responsive design
- Accessible form elements
- Smooth animations and transitions

## Installation

This component is part of the Nesolagus dashboard repository. To use it in other repos within the monorepo:

1. Copy the `LoginWidget.tsx` file to your project's components directory
2. Ensure you have the required dependencies:
   - `next` (for Link and Image components)
   - `lucide-react` (for icons)
   - `tailwindcss` (for styling)

## Basic Usage

```tsx
import LoginWidget from '@/components/auth/LoginWidget'

export default function LoginPage() {
  return <LoginWidget />
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `redirectPath` | `string` | `"/"` | Path to redirect to after sign in (when using Link-based auth) |
| `onSignIn` | `(email: string, password: string) => void \| Promise<void>` | `undefined` | Optional callback for custom authentication logic |
| `title` | `string` | `"Welcome to Nesolagus"` | Main heading text |
| `subtitle` | `string` | `"Transform community insights into strategic action"` | Subtitle text below the heading |
| `logoPath` | `string` | `"/logos/nesolagus-bug.png"` | Path to logo image |
| `logoAlt` | `string` | `"Nesolagus"` | Alt text for the logo |
| `showFooter` | `boolean` | `true` | Whether to show footer text |
| `footerText` | `string` | `"Secure access to your community intelligence dashboard"` | Footer text content |

## Examples

### Simple Redirect

```tsx
<LoginWidget redirectPath="/dashboard" />
```

### Custom Authentication

```tsx
<LoginWidget
  onSignIn={async (email, password) => {
    try {
      await signIn({ email, password })
      router.push('/dashboard')
    } catch (error) {
      console.error('Authentication failed', error)
    }
  }}
/>
```

### Custom Branding

```tsx
<LoginWidget
  title="Welcome Back"
  subtitle="Sign in to your account"
  logoPath="/custom-logo.png"
  logoAlt="My App"
  footerText="Secure login powered by Nesolagus"
/>
```

### Minimal Version

```tsx
<LoginWidget
  showFooter={false}
  title="Sign In"
  subtitle=""
/>
```

### Integration with NextAuth

```tsx
'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import LoginWidget from '@/components/auth/LoginWidget'

export default function LoginPage() {
  const router = useRouter()

  return (
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
          // Handle error (show toast, etc.)
        }
      }}
    />
  )
}
```

### Integration with Supabase

```tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import LoginWidget from '@/components/auth/LoginWidget'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  return (
    <LoginWidget
      onSignIn={async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (!error) {
          router.push('/dashboard')
        } else {
          // Handle error
        }
      }}
    />
  )
}
```

## Customization

### Colors

The component uses Tailwind CSS with the Nesolagus color scheme. To customize colors, you can:

1. Modify the Tailwind config to use your brand colors
2. Override specific classes using CSS modules
3. Fork the component and update the color values directly

Primary colors used:
- `#64B37A` - Primary green
- `#2F6D49` - Dark green

### Layout

Wrap the component in your own container for custom layout:

```tsx
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
  <LoginWidget />
</div>
```

## Styling Notes

- The component uses a max-width of `md` (28rem / 448px)
- Inputs have focus states with the primary brand color
- The sign-in button has a gradient and hover scale effect
- The card has a shadow-2xl for depth

## Accessibility

- All form inputs have proper labels
- Form fields are marked as required
- Semantic HTML elements are used throughout
- Keyboard navigation is fully supported

## Security Considerations

When implementing authentication:

1. Always use HTTPS in production
2. Implement rate limiting on your backend
3. Use secure password hashing (bcrypt, argon2, etc.)
4. Consider adding CSRF protection
5. Implement proper session management
6. Add error handling without revealing sensitive information

## Migration Guide

If you're migrating from an existing login implementation:

1. Copy `LoginWidget.tsx` to your project
2. Replace your existing login form with `<LoginWidget />`
3. Update the `onSignIn` prop with your authentication logic
4. Customize branding props as needed
5. Test thoroughly in your environment

## Support

For issues, questions, or contributions, please refer to the main Nesolagus dashboard repository.

## License

This component is part of the Nesolagus platform and follows the same license as the main repository.
