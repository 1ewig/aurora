import { NextResponse } from 'next/server'
import { createServerClient, setAuthCookies } from '@insforge/sdk/ssr'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'AUTH_VALIDATION', message: 'Email and password are required.' },
        { status: 400 }
      )
    }

    const client = createServerClient()
    const { data, error } = await client.auth.signUp({
      email,
      password,
      name,
      redirectTo: `${new URL(request.url).origin}/login`,
    })

    if (error) {
      return NextResponse.json(
        {
          error: error?.error ?? 'AUTH_SIGNUP_FAILED',
          message: error?.message ?? 'Sign up failed',
        },
        { status: error?.statusCode ?? 400 }
      )
    }

    const response = NextResponse.json({
      user: data?.user ?? null,
      requireEmailVerification: data?.requireEmailVerification ?? false,
    })

    if (data?.accessToken) {
      setAuthCookies(response.cookies, {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      })
    }

    return response
  } catch (err) {
    console.error('Sign-up route error:', err)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
