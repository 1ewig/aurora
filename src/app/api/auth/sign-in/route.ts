import { NextResponse } from 'next/server'
import { createServerClient, setAuthCookies } from '@insforge/sdk/ssr'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'AUTH_VALIDATION', message: 'Email and password are required.' },
        { status: 400 }
      )
    }

    const client = createServerClient()
    const { data, error } = await client.auth.signInWithPassword({ email, password })

    if (error || !data?.accessToken) {
      return NextResponse.json(
        {
          error: error?.error ?? 'AUTH_UNAUTHORIZED',
          message: error?.message ?? 'Sign in failed',
          statusCode: error?.statusCode ?? 401,
        },
        { status: error?.statusCode ?? 401 }
      )
    }

    const response = NextResponse.json({ user: data.user })
    setAuthCookies(response.cookies, {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    })

    return response
  } catch (err) {
    console.error('Sign-in route error:', err)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
