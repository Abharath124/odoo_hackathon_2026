export function Table({ children }) {
  return (
    <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm min-w-[500px]">
          {children}
        </table>
      </div>
    </div>
  )
}

export function TableHead({ children }) {
  return (
    <thead className="border-b border-zinc-100 bg-zinc-50">
      <tr>{children}</tr>
    </thead>
  )
}

export function TableHeadCell({ children, className = '' }) {
  return (
    <th className={`text-left px-5 py-3 text-xs font-medium text-secondary whitespace-nowrap ${className}`}>
      {children}
    </th>
  )
}

export function TableBody({ children }) {
  return <tbody>{children}</tbody>
}

export function TableRow({ children, onClick, className = '' }) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-zinc-50 last:border-0 transition-colors ${onClick ? 'cursor-pointer' : ''} hover:bg-zinc-50 ${className}`}
    >
      {children}
    </tr>
  )
}

export function TableCell({ children, className = '' }) {
  return (
    <td className={`px-5 py-3 text-secondary whitespace-nowrap ${className}`}>
      {children}
    </td>
  )
}

export function TableEmpty({ message = 'No data found', icon = '📭' }) {
  return (
    <tr>
      <td colSpan={100}>
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <span className="text-2xl">{icon}</span>
          <p className="text-sm text-secondary">{message}</p>
        </div>
      </td>
    </tr>
  )
}

export function TableLoading() {
  return (
    <tr>
      <td colSpan={100}>
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 border-zinc-200 border-t-primary rounded-full animate-spin" />
        </div>
      </td>
    </tr>
  )
}
