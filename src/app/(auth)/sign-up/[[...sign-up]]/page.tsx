import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return <div className=' min-h-screen bg-slate-100'>
   <div className='flex items-center justify-center h-screen bg-white/60'>
     <SignUp />
   </div>
  </div>
}