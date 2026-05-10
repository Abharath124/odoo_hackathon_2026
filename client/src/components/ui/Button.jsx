const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
}

const variants = {
  primary: 'bg-primary text-white hover:opacity-80',
  secondary: 'bg-zinc-100 text-primary hover:bg-zinc-200',
  outline: 'border border-zinc-200 text-primary hover:bg-zinc-50',
  ghost: 'text-secondary hover:text-primary hover:bg-zinc-100',
  danger: 'bg-red-500 text-white hover:bg-red-600',
}

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  return (
    <button
      {...props}
      className={`w-full rounded-lg font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}
