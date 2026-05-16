import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useDispatch } from 'react-redux'
import api from '../utils/api'
import { fetchSiteSettings } from '../store/siteSlice'
import BrandLogo from '../components/BrandLogo'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  additionalInfo: z.string().optional(),
  password: z.string().min(8, 'Minimum 8 characters'),
  confirm: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
})

export default function Signup() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    dispatch(fetchSiteSettings())
  }, [dispatch])

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/register', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        city: data.city,
        country: data.country,
        additionalInfo: data.additionalInfo,
        password: data.password,
      })
      navigate('/login')
    } catch (err) {
      console.error('[signup]', err)
      setError('root', { message: err.response?.data?.message || err.message || 'Registration failed' })
    }
  }

  return (
    <Card className="max-w-2xl w-full">

      <CardHeader>
        <div className="flex justify-center mb-4">
          <BrandLogo size="lg" />
        </div>

        <CardTitle description="Create your account to get started">Get started</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input id="firstName" label="First name" type="text" placeholder="John" required error={errors.firstName?.message} {...register('firstName')} />
            <Input id="lastName" label="Last name" type="text" placeholder="Doe" required error={errors.lastName?.message} {...register('lastName')} />
          </div>

          <Input id="email" label="Email address" type="email" placeholder="you@example.com" required error={errors.email?.message} {...register('email')} />

          <Input id="phone" label="Phone number" type="tel" placeholder="+1 (555) 000-0000" required error={errors.phone?.message} {...register('phone')} />

          <div className="grid grid-cols-2 gap-4">
            <Input id="city" label="City" type="text" placeholder="New York" required error={errors.city?.message} {...register('city')} />
            <Input id="country" label="Country" type="text" placeholder="United States" required error={errors.country?.message} {...register('country')} />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="additionalInfo" className="text-xs font-medium text-secondary">Additional Information</label>
            <textarea
              id="additionalInfo"
              placeholder="Tell us more about yourself (optional)"
              rows={3}
              {...register('additionalInfo')}
              className="w-full border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-primary bg-zinc-50 placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input id="password" label="Password" type="password" placeholder="••••••••" required error={errors.password?.message} {...register('password')} />
            <Input id="confirm" label="Confirm password" type="password" placeholder="••••••••" required error={errors.confirm?.message} {...register('confirm')} />
          </div>

          <Button type="submit" disabled={isSubmitting} className="mt-2">
            {isSubmitting ? 'Creating account...' : 'Sign Up'}
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
