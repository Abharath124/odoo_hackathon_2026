import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm, useController } from 'react-hook-form'
import { Save, Palette, Mail, KeyRound, Globe, CheckCircle, Loader2, ImageIcon } from 'lucide-react'
import { fetchSettings, saveSettings } from '../../store/settingsSlice'
import { fetchSiteSettings } from '../../store/siteSlice'
import { Input } from '../../components/ui/Input'
import api from '../../utils/api'

function ColorField({ label, name, placeholder, control }) {
  const { field } = useController({ name, control, defaultValue: '' })
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-secondary">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={field.value || '#000000'}
          onChange={(e) => field.onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer p-0.5 bg-white shrink-0"
        />
        <input
          type="text"
          value={field.value || ''}
          onChange={(e) => field.onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-primary bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
        />
      </div>
    </div>
  )
}

function Section({ icon: Icon, title, desc, children }) {
  return (
    <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon size={15} className="text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-primary">{title}</h2>
          {desc && <p className="text-xs text-secondary">{desc}</p>}
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

export default function AdminSettings() {
  const dispatch = useDispatch()
  const { data, loading, saving } = useSelector((state) => state.settings)
  const { logo } = useSelector((state) => state.site)
  const [saved, setSaved] = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)
  const logoRef = useRef(null)

  const { register, handleSubmit, reset, control } = useForm()

  useEffect(() => { dispatch(fetchSettings()) }, [])
  useEffect(() => { if (Object.keys(data).length) reset(data) }, [data])

  const handleLogoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogoPreview(URL.createObjectURL(file))
    const formData = new FormData()
    formData.append('logo', file)
    try {
      await api.post('/admin/settings/logo', formData)
      dispatch(fetchSiteSettings())
    } catch (err) {
      console.error('Logo upload failed:', err.response?.data || err.message)
    }
  }

  const onSubmit = async (formData) => {
    const cleaned = Object.fromEntries(
      Object.entries(formData).filter(([, v]) => v !== '••••••••')
    )
    await dispatch(saveSettings(cleaned))
    dispatch(fetchSiteSettings())
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={20} className="text-secondary animate-spin" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-primary tracking-tight">Settings</h1>
          <p className="text-sm text-secondary mt-1">Manage your application configuration.</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:opacity-80 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          {saving ? (
            <><Loader2 size={15} className="animate-spin" /> Saving...</>
          ) : saved ? (
            <><CheckCircle size={15} /> Saved</>
          ) : (
            <><Save size={15} /> Save changes</>
          )}
        </button>
      </div>

      {/* Logo */}
      <Section icon={ImageIcon} title="Logo" desc="Upload your brand logo shown on auth pages and navbar.">
        <div className="flex items-center gap-5">
          <div
            onClick={() => logoRef.current.click()}
            className="w-16 h-16 rounded-xl border-2 border-dashed border-zinc-200 flex items-center justify-center cursor-pointer hover:border-zinc-400 transition-colors overflow-hidden shrink-0"
          >
            {logoPreview || logo ? (
              <img src={logoPreview || `http://localhost:5000${logo}`} alt="logo" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon size={20} className="text-zinc-300" />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <button type="button" onClick={() => logoRef.current.click()} className="text-sm font-medium text-primary hover:underline text-left">
              {logo || logoPreview ? 'Change logo' : 'Upload logo'}
            </button>
            <p className="text-xs text-secondary">PNG, JPG or WebP · Max 2MB</p>
          </div>
          <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
        </div>
      </Section>

      {/* Branding */}
      <Section icon={Globe} title="Branding" desc="Customize your landing page content.">
        <div className="flex flex-col gap-4">
          <Input id="site_name" label="Site name" type="text" placeholder="TravelLoop" {...register('site_name')} />
          <Input id="site_tagline" label="Tagline" type="text" placeholder="Explore the world, together." {...register('site_tagline')} />
        </div>
      </Section>

      {/* Colors */}
      <Section icon={Palette} title="Colors" desc="Set your primary and secondary brand colors.">
        <div className="flex flex-col gap-4">
          {[
            { label: 'Primary color', name: 'primary_color', placeholder: '#18181b' },
            { label: 'Secondary color', name: 'secondary_color', placeholder: '#71717a' },
          ].map(({ label, name, placeholder }) => (
            <ColorField key={name} label={label} name={name} placeholder={placeholder} control={control} />
          ))}
        </div>
      </Section>

      {/* SMTP */}
      <Section icon={Mail} title="SMTP" desc="Configure email delivery settings.">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input id="smtp_host" label="SMTP Host" type="text" placeholder="smtp.gmail.com" {...register('smtp_host')} />
            <Input id="smtp_port" label="SMTP Port" type="text" placeholder="587" {...register('smtp_port')} />
          </div>
          <Input id="smtp_user" label="SMTP User" type="text" placeholder="you@gmail.com" {...register('smtp_user')} />
          <Input id="smtp_pass" label="SMTP Password" type="password" placeholder="••••••••" {...register('smtp_pass')} />
          <Input id="smtp_from" label="From Address" type="text" placeholder="you@gmail.com" {...register('smtp_from')} />
        </div>
      </Section>

      {/* JWT */}
      <Section icon={KeyRound} title="JWT" desc="Configure JSON Web Token settings.">
        <div className="flex flex-col gap-4">
          <Input id="jwt_secret" label="JWT Secret" type="password" placeholder="••••••••" {...register('jwt_secret')} />
          <Input id="jwt_expires_in" label="Token Expiry" type="text" placeholder="7d" {...register('jwt_expires_in')} />
        </div>
      </Section>

    </form>
  )
}
