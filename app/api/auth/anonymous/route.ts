import { NextResponse } from 'next/server'
import { createAnonymousUser } from '@/lib/auth'
import jwt from 'jsonwebtoken'

export async function POST() {
  try {
    const user = await createAnonymousUser()

    if (!user) {
      return NextResponse.json({ error: 'Failed to create anonymous user' }, { status: 500 })
    }

    // Create a simple JWT token for anonymous users
    const token = jwt.sign(
      { userId: user.id, isAnonymous: true },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '24h' }
    )

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        isAnonymous: true
      }
    })

    // Set the token as an HTTP-only cookie
    response.cookies.set('anonymous-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 24 hours
    })

    return response
  } catch (error) {
    console.error('Anonymous auth error:', error)
    return NextResponse.json(
      { error: 'Failed to create anonymous session' },
      { status: 500 }
    )
  }
}
