// Admin home — redirect to contests
import { redirect } from 'next/navigation'

export default function AdminPage() {
  redirect('/admin/contests')
}
