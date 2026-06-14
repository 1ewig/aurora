import { NextResponse } from 'next/server'
import { createServerClient } from '@insforge/sdk/ssr'

export async function POST() {
  try {
    const client = createServerClient()
    await client.auth.signOut()

    const response = NextResponse.json({ success: true })
    response.cookies.delete('insforge_access_token')
    response.cookies.delete('insforge_refresh_token')

    return response
  } catch (err) {
    console.error('Sign-out route error:', err)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to sign out.' },
      { status: 500 }
    )
  }
}
