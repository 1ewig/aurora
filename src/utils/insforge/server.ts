import { cookies } from 'next/headers'
import { createServerClient } from '@insforge/sdk/ssr'

export async function createServerInsforge() {
  return createServerClient({ cookies: await cookies() })
}
