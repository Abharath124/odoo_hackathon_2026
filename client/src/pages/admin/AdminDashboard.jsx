import { useSelector } from 'react-redux'

const stats = [
  { label: 'Total Users', value: '0', change: '+0 this week' },
  { label: 'Active Sessions', value: '0', change: 'Live now' },
  { label: 'New Registrations', value: '0', change: '+0 today' },
  { label: 'Pending Verifications', value: '0', change: 'Needs action' },
]

export default function AdminDashboard() {
  const { user } = useSelector((state) => state.auth)

  return (
    <div className="flex flex-col gap-8">

      <div>
        <h1 className="text-xl font-semibold text-primary tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-secondary mt-1">
          Logged in as <span className="font-medium text-primary">{user?.name}</span> · {user?.email}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, change }) => (
          <div key={label} className="bg-white border border-zinc-100 rounded-2xl px-6 py-5">
            <p className="text-xs text-secondary font-medium">{label}</p>
            <p className="text-3xl font-semibold text-primary mt-1">{value}</p>
            <p className="text-xs text-secondary mt-2">{change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white border border-zinc-100 rounded-2xl px-6 py-5">
          <h2 className="text-sm font-semibold text-primary mb-4">Recent Users</h2>
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <span className="text-2xl">👥</span>
            <p className="text-sm text-secondary">No users yet</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-100 rounded-2xl px-6 py-5">
          <h2 className="text-sm font-semibold text-primary mb-4">System Activity</h2>
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <span className="text-2xl">📊</span>
            <p className="text-sm text-secondary">No activity yet</p>
          </div>
        </div>
      </div>

    </div>
  )
}
