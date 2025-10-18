'use client'

export default function DownloadPDF({ href = '/print/report' }: { href?: string }) {
  return (
    <a
      href={href}
      className="rounded-md border px-3 py-2 text-sm font-medium bg-white hover:bg-gray-50"
    >
      Download PDF
    </a>
  )
}
