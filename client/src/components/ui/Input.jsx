export function Input({ label, required, id, rightLabel, error, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="text-xs font-medium text-secondary">
            {label}
            {required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
          {rightLabel && rightLabel}
        </div>
      )}
      <input
        id={id}
        {...props}
        className={`w-full border rounded-lg px-3.5 py-2.5 text-sm text-primary bg-zinc-50 placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:bg-white focus:border-transparent transition-all ${
          error ? 'border-red-400 focus:ring-red-400' : 'border-zinc-200 focus:ring-primary'
        } ${props.className ?? ''}`}
      />
      <p className="text-xs text-red-400 h-4">{error ?? ''}</p>
    </div>
  )
}
