import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export default async function DemoPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    // For demo, we'll redirect to sign up
    redirect('/auth/signup')
  }

  // If user is logged in, redirect to dashboard
  redirect('/dashboard')
}
