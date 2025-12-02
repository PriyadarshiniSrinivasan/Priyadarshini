'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const t = localStorage.getItem('token') || sessionStorage.getItem('token')
    router.replace(t ? '/dashboard' : '/login')
  }, [router])

  return <div className="text-slate-600">Redirecting…</div>
}

function HomePage() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Biodata Manager
          </h1>
          <p className="text-xl mb-8 opacity-90">

            Streamline your material and data management 
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/login" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
            >
              Get Started
            </Link>
            <Link 
              href="/dashboard" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
      
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">
            Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Material Management</h3>
              <p className="text-gray-600">Track and manage materials efficiently</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Data Analytics</h3>
              <p className="text-gray-600">Get insights from your data</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Secure Access</h3>
              <p className="text-gray-600">Keep your data safe and secure</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}