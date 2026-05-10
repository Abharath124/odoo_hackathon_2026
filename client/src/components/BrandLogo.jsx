import { useSelector } from 'react-redux'

export default function BrandLogo({ size = 'md' }) {
  const { logo, site_name } = useSelector((state) => state.site)

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
  }

  if (logo) {
    return (
      <img
        src={`http://localhost:5000${logo}`}
        alt={site_name}
        className={`${sizes[size]} rounded-xl object-cover`}
      />
    )
  }

  return (
    <div
      style={{ backgroundColor: 'var(--color-primary)' }}
      className={`${sizes[size]} rounded-xl flex items-center justify-center text-white font-semibold`}
    >
      ⬡
    </div>
  )
}
