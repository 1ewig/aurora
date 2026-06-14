import { NextResponse } from 'next/server'
import { createServerClient, setAuthCookies } from '@insforge/sdk/ssr'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, otp } = body

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'AUTH_VALIDATION', message: 'Email and verification code are required.' },
        { status: 400 }
      )
    }

    const client = createServerClient()
    const { data, error } = await client.auth.verifyEmail({ email, otp })

    if (error) {
      return NextResponse.json(
        {
          error: error?.error ?? 'AUTH_VERIFY_FAILED',
          message: error?.message ?? 'Verification failed',
        },
        { status: error?.statusCode ?? 400 }
      )
    }

    const response = NextResponse.json({ user: data?.user ?? null })

    if (data?.accessToken) {
      setAuthCookies(response.cookies, {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      })
    }

    return response
  } catch (err) {
    console.error('Verify-email route error:', err)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
