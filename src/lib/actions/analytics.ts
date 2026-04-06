'use server'

import { logPageView } from '@/lib/audit'

export async function trackPageView(path: string) {
  if (!path) return
  await logPageView(path)
}
