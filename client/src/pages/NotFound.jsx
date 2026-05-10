import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center gap-4 px-4">
      <span className="text-6xl font-semibold text-zinc-200">404</span>
      <h1 className="text-lg font-semibold text-primary tracking-tight">Page not found</h1>
      <p className="text-sm text-secondary">The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-2 text-sm bg-primary text-white px-5 py-2.5 rounded-lg hover:opacity-80 transition-all">
        Go home
      </Link>
    </div>
  )
}
