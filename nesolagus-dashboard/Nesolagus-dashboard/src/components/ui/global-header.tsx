import Image from 'next/image'
import Link from 'next/link'

export default function GlobalHeader() {
  return (
    <header className="border-b bg-gray-50">
      <div className="mx-auto px-4 py-3">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center">
          {/* Left spacer (sidebar already shows bug) */}
          <div />

          {/* Center: Nesolagus wordmark + project name */}
          <div className="flex items-center justify-center gap-3">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/logos/nesolagus-horizontal.png"
                alt="Nesolagus"
                width={160}
                height={32}
                priority
              />
            </Link>
            <div className="h-4 w-px bg-gray-300" aria-hidden />
            <span className="text-sm font-medium text-gray-900">GHAC Community Den</span>
          </div>

          {/* Right: GHAC client logo */}
          <div className="flex items-center justify-end">
            <span className="sr-only">Greater Hartford Arts Council</span>
            <Image
              src="/logos/ghac-logo-bug.png"
              alt="Greater Hartford Arts Council"
              width={44}
              height={44}
              className="shrink-0 rounded-full ring-1 ring-gray-300"
              priority
            />
          </div>
        </div>
      </div>
    </header>
  )
}
