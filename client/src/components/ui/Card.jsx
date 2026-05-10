export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-zinc-200 w-full overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-8 pt-8 pb-6 border-b border-zinc-100 ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children, description, className = '' }) {
  return (
    <div className={className}>
      <h2 className="text-xl font-semibold text-primary tracking-tight">{children}</h2>
      {description && <p className="text-sm text-secondary mt-1">{description}</p>}
    </div>
  )
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={`px-8 pt-6 pb-6 ${className}`}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`px-8 py-4 border-t border-zinc-100 ${className}`}>
      {children}
    </div>
  )
}
