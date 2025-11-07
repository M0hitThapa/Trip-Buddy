'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import TrendingTrips from '../create-new-trip/_components/TrendingTrips'
import React from 'react'

export default function ExplorePage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Explore</h1>
          <div>
            <TrendingTrips
              onSelectTrip={() => {}}
              gridClassName="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

