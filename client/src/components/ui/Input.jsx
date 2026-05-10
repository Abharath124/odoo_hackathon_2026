import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function Input({ label, required, id, rightLabel, error, type, ...props }) {
  const [showPassword, setShowPassword] = useState(false)
  const isPasswordField = type === 'password'
  const inputType = isPasswordField && showPassword ? 'text' : type

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
      <div className="relative">
        <input
          id={id}
          type={inputType}
          {...props}
          className={`w-full border rounded-lg px-3.5 py-2.5 text-sm text-primary bg-zinc-50 placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:bg-white focus:border-transparent transition-all ${
            error ? 'border-red-400 focus:ring-red-400' : 'border-zinc-200 focus:ring-primary'
          } ${isPasswordField ? 'pr-10' : ''} ${props.className ?? ''}`}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      <p className="text-xs text-red-400 h-4">{error ?? ''}</p>
    </div>
  )
}
