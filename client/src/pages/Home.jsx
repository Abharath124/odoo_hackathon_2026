import { useSelector } from 'react-redux'

const stats = [
  { label: 'Total Users', value: '0' },
  { label: 'Active Sessions', value: '0' },
  { label: 'Pending Tasks', value: '0' },
]

function Skeleton({ className = '' }) {
  return <div className={`bg-zinc-100 rounded-lg animate-pulse ${className}`} />
}

export default function Home() {
  const { user, loading } = useSelector((state) => state.auth)

  return (
    <div className="flex flex-col gap-8">

      <div>
        {loading || !user ? (
          <>
            <Skeleton className="h-7 w-56 mb-2" />
            <Skeleton className="h-4 w-72" />
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-primary tracking-tight">
              Welcome back, {user.name} 👋
            </h1>
            <p className="text-sm text-secondary mt-1">Here's what's happening on Travel Loop.</p>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-white border border-zinc-100 rounded-2xl px-6 py-5">
            <p className="text-xs text-secondary font-medium">{label}</p>
            <p className="text-3xl font-semibold text-primary mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-zinc-100 rounded-2xl px-6 py-5">
        <h2 className="text-sm font-semibold text-primary mb-4">Recent Activity</h2>
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <span className="text-2xl">📭</span>
          <p className="text-sm text-secondary">No activity yet</p>
        </div>
      </div>

    </div>
  )
}
