import { redirect } from 'next/navigation'

export default function RegisterAssetPage() {
  redirect('/signup?profile=asset')
}
