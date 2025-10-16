import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Report Export',
  description: 'Printable report export',
}

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Hide app chrome from the root layout and normalize background for print */}
        <style dangerouslySetInnerHTML={{ __html: `
          aside { display: none !important; }
          header { display: none !important; }
          #main-content { margin-left: 0 !important; }
          .bg-gray-50 { background: #fff !important; }
          @page { size: auto; margin: 0.5in; }
          @media print {
            a[href]:after { content: '' !important; }
          }
        ` }} />
        <div className="min-h-screen bg-white text-gray-900">
          {children}
        </div>
      </body>
    </html>
  )
}
