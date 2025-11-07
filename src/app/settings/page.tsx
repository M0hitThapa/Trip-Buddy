'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'
import { useUser } from '@clerk/nextjs'

export default function SettingsPage() {
  const { user } = useUser()
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="p-6 max-w-2xl">
          <h1 className="text-2xl font-bold mb-4">Settings</h1>
          {!user ? (
            <div className="text-neutral-600">Sign in to manage your profile.</div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border bg-white p-4">
                <div className="text-sm text-neutral-500">Name</div>
                <div className="text-base font-medium">{user.fullName}</div>
              </div>
              <div className="rounded-lg border bg-white p-4">
                <div className="text-sm text-neutral-500">Email</div>
                <div className="text-base font-medium">{user.primaryEmailAddress?.emailAddress}</div>
              </div>
              <div className="rounded-lg border bg-white p-4">
                <div className="text-sm text-neutral-500">Plan</div>
                <div className="text-base font-medium">Free</div>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

