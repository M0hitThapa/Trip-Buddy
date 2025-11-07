'use client'

import { Play } from 'lucide-react'
import Image from 'next/image'
 
import React from 'react'
import { ShinyButton } from './shiny-button'

import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

function Hero() {
  const {isLoaded, isSignedIn} = useUser()
  const router = useRouter()

  function onSend() {
    if(!isLoaded) return;
    if(!isSignedIn) {
      router.push("/sign-in")
      return;
    }
    router.push("/create-new-trip")
  }
  return (
    <div className='px-4 py-2 flex flex-col items-center gap-4 mt-12 md:mt-20 mb-10 '>
        <button className='border rounded-full text-xs px-4 py-1 border-neutral-200 bg-emerald-50/20 text-neutral-900 font-semibold hover:bg-neutral-50  cursor-pointer transition-all duration-300'>
            Best Place to travel in this season
            {/*https://i.pinimg.com/736x/21/61/9d/21619df361a80e989ac536cfab5d4ab0.jpg */}

        </button>
        <div>
            <h1 className=' font-semibold mt-3 md:text-7xl sm:text-4xl text-3xl text-shadow-lg/10 text-black text-center tracking-tight '>
              <div className='flex gap-2 items-center '>
                <Image src="/arrow.png" alt='arrow-image' height={150} width={150} className='hidden md:flex' />
               <span className='bg-gradient-to-r from-neutral-900 to-neutral-500 bg-clip-text text-transparent  '>
                Plan Your Trip in Seconds <br /> Powered by <span className='relative inline-block before:absolute before:-inset-1 before:block before:-skew-y-2 before:bg-teal-300/50 before:rounded before:border-2 before:border-white/80 before:shadow-input' >
                  <span className='relative text-teal-800 text-shadow-2xl '>TripFriend</span>
                </span>
               </span>
               <Image src="/travel.png" alt='travel-image' height={150} width={150} className='hidden md:flex' />
          </div>
            </h1>
            <p className='max-w-2xl text-center mt-4 mx-auto text-md text-neutral-800'>Share your preferences, get a day-by-day plan with local tips.</p>
        </div>
        <div className='flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-sm w-full sm:w-auto justify-center'>
            
             <ShinyButton onClick={() => onSend()}  className="relative z-10 h-12 w-full sm:w-auto px-6 py-2 text-base shadow-lg transition-shadow duration-300 hover:shadow-xl cursor-pointer">
            Plan your trip
          </ShinyButton>
             <button className='w-full sm:w-auto cursor-pointer px-4 py-1 text-black backdrop-blur-sm border border-gray-400 rounded-md hover:shadow-[0px_0px_4px_4px_rgba(0,0,0,0.1)] bg-white/[0.2] text-sm transition duration-200'>
                <div className='flex gap-2 items-center px-4 py-2 justify-center'>
                  <Play className='h-5 w-5' />
                Demo
                </div>
               
             </button>
             
        </div>
    </div>
  )
}

export default Hero