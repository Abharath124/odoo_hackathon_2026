import { Outlet } from 'react-router-dom'
import { PublicNav, PublicFooter } from '../components/PublicLayout'

export default function GuestLayout() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: '#fafafa',
        backgroundImage: 'radial-gradient(circle, #d4d4d8 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <PublicNav />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}
