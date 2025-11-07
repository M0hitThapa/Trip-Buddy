'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useParams, useRouter } from 'next/navigation'
import React from 'react'

export default function TripEditComingSoonPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const id = params?.id
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h1 className="text-2xl font-bold mb-2">Edit with AI</h1>
          <p className="text-neutral-600 mb-6">Coming soon for Trip {id}</p>
          <div className="flex gap-3">
            <button
              className="rounded-sm bg-neutral-950 px-4 py-2 text-sm font-bold text-white hover:bg-neutral-800"
              onClick={() => router.back()}
            >
              ← Back
            </button>
            <a
              href={`/trips/${id}`}
              className="rounded-sm border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
            >
              View Trip
            </a>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


