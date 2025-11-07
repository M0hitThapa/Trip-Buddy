"use client"
import { useMutation } from 'convex/react'
import React, { ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../../convex/_generated/api'
import { useUser } from '@clerk/nextjs'
import { UserDetailContext } from '@/context/UserDetailContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function Provider({ children }: { children: ReactNode }) {

    const CreateUser = useMutation(api.user.CreateNewUser)
    const [userDetail, setUserDetail] = useState<unknown>()
    const {user} = useUser()

    const CreateNewUser = useCallback(async () => {
        const result = await CreateUser({
            email: user?.primaryEmailAddress?.emailAddress ?? '',
            imageUrl: user?.imageUrl ?? '',
            name: user?.fullName ?? ''
        })
        setUserDetail(result)
    }, [CreateUser, user])

    useEffect(() => {
        if (user) void CreateNewUser();
    }, [user, CreateNewUser])
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        retry: 1,
      }
    }
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <UserDetailContext.Provider value={{userDetail, setUserDetail}}>
        <div>{children}</div>
      </UserDetailContext.Provider>
    </QueryClientProvider>
  )
}

export default Provider

export const useUserDetail = () => {
  return useContext(UserDetailContext)
}