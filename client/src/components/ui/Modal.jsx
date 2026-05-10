import { useEffect } from 'react'

export function Modal({ open, onClose, title, children, size = 'sm' }) {
  const sizes = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center sm:px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className={`
        relative bg-white w-full ${sizes[size]}
        rounded-t-3xl sm:rounded-2xl shadow-xl z-10
        flex flex-col
        max-h-[92vh] sm:max-h-[85vh]
        animate-slide-up sm:animate-none
      `}>
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-zinc-200" />
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
          <h3 className="text-sm font-semibold text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-secondary hover:text-primary hover:bg-zinc-100 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}

export function ModalFooter({ children }) {
  return (
    <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-end gap-2 shrink-0">
      {children}
    </div>
  )
}
