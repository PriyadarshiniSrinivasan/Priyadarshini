
import './globals.css'
import Link from 'next/link'

export const metadata = { 
  title: 'Biodata Manager', 
  description: 'Material and data management system' 
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b bg-white shadow-sm">
          <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600 hover:text-blue-700">
              Biodata Manager
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/login" className="px-3 py-2 text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link href="/dashboard" className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Dashboard
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}

