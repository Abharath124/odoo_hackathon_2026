import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { PublicNav, PublicFooter } from '../components/PublicLayout'

const features = [
  { icon: '⚡', title: 'Fast & Lightweight', desc: 'Built for performance with minimal overhead.' },
  { icon: '🔒', title: 'Secure by Default', desc: 'JWT auth, OTP verification and encrypted passwords.' },
  { icon: '🧩', title: 'Modular Design', desc: 'Clean component architecture, easy to extend.' },
]

export default function Landing() {
  const { site_tagline } = useSelector((state) => state.site)
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const dashboardPath = user?.role === 'admin' ? '/admin/dashboard' : '/home'

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

      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
          <span className="text-xs font-medium text-secondary border border-zinc-200 px-3 py-1 rounded-full">
            Open source · Free to use
          </span>
          <h1 className="text-5xl font-semibold text-primary tracking-tight leading-tight">
            {site_tagline}
          </h1>
          <p className="text-base text-secondary max-w-md leading-relaxed">
            A clean, fast and secure platform to manage your team, users and workflows — without the clutter.
          </p>
          <div className="flex items-center gap-3 mt-2">
            {isAuthenticated ? (
              <Link to={dashboardPath} className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-80 active:scale-[0.98] transition-all">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/signup" className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-80 active:scale-[0.98] transition-all">
                  Start for free
                </Link>
                <Link to="/login" className="border border-zinc-200 text-secondary px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-50 hover:text-primary transition-all">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-100 px-8 py-16">
        <div className="max-w-3xl mx-auto grid grid-cols-1 gap-8 sm:grid-cols-3">
          {features.map(({ icon, title, desc }) => (
            <div key={title} className="flex flex-col gap-3">
              <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg">{icon}</span>
              <h3 className="text-sm font-semibold text-primary">{title}</h3>
              <p className="text-sm text-secondary leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
