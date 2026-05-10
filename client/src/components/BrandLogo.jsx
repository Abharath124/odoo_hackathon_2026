import { useSelector } from 'react-redux'
import { useState } from 'react'

export default function BrandLogo({ size = 'md' }) {
  const { logo, site_name, primary_color } = useSelector((state) => state.site)
  const [imageError, setImageError] = useState(false)

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-2xl',
  }

  if (logo && !imageError) {
    return (
      <img
        src={`http://localhost:5000${logo}`}
        alt={site_name}
        className={`${sizes[size]} rounded-xl object-cover`}
        onError={() => setImageError(true)}
      />
    )
  }

  return (
    <div
      style={{ backgroundColor: primary_color || 'var(--color-primary)' }}
      className={`${sizes[size]} rounded-xl flex items-center justify-center text-white font-semibold`}
    >
      ⬡
    </div>
  )
}
