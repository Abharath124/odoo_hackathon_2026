import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../store/authSlice'
import api from '../utils/api'
import BrandLogo from '../components/BrandLogo'

const schema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Minimum 8 characters'),
  confirm: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
})

export default function Signup() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: zodResolver(schema),
  })

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const onSubmit = async (data) => {
    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('email', data.email)
      formData.append('password', data.password)
      if (avatarFile) formData.append('avatar', avatarFile)

      const res = await api.post('/auth/register', formData)
      if (res.data.token) {
        dispatch(setCredentials({ token: res.data.token, user: res.data.user }))
        navigate(res.data.user.role === 'admin' ? '/admin' : '/home')
      } else {
        navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`)
      }
    } catch (err) {
      console.error('[signup]', err)
      setError('root', { message: err.response?.data?.message || err.message || 'Registration failed' })
    }
  }

  return (
    <Card className="max-w-sm w-full">

      <CardHeader>
        {/* Photo upload */}
        <div className="flex flex-col items-center mb-4">
          <div className="mb-3">
            <BrandLogo size="lg" />
          </div>
          <div
            onClick={() => fileRef.current.click()}
            className="relative w-20 h-20 rounded-full border-2 border-dashed border-zinc-200 flex items-center justify-center cursor-pointer hover:border-zinc-400 transition-colors overflow-hidden group"
          >
            {preview ? (
              <img src={preview} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Camera size={20} className="text-zinc-400" />
                <span className="text-xs text-zinc-400">Photo</span>
              </div>
            )}
            {preview && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={18} className="text-white" />
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <p className="text-xs text-zinc-400 mt-2">Upload profile photo</p>
        </div>

        <CardTitle description="Create your account to get started">Get started</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input id="name" label="Full name" type="text" placeholder="John Doe" required error={errors.name?.message} {...register('name')} />
          <Input id="email" label="Email address" type="email" placeholder="you@example.com" required error={errors.email?.message} {...register('email')} />
          <Input id="password" label="Password" type="password" placeholder="••••••••" required error={errors.password?.message} {...register('password')} />
          <Input id="confirm" label="Confirm password" type="password" placeholder="••••••••" required error={errors.confirm?.message} {...register('confirm')} />
          <Button type="submit" disabled={isSubmitting} className="mt-1">
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
          {errors.root && <p className="text-xs text-red-400 text-center">{errors.root.message}</p>}
        </form>
      </CardContent>

      <CardFooter>
        <p className="text-xs text-zinc-400 w-full text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </CardFooter>

    </Card>
  )
}
