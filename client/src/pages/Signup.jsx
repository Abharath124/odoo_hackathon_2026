import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import api from '../utils/api'

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
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/register', { name: data.name, email: data.email, password: data.password })
      navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`)
    } catch (err) {
      setError('root', { message: err.response?.data?.message || 'Registration failed' })
    }
  }

  return (
    <Card className="max-w-sm w-full">

      <CardHeader>
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center mb-4">
          <span className="text-white text-sm">⬡</span>
        </div>
        <CardTitle description="Create your account to get started">Get started</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input id="name" label="Full name" type="text" placeholder="John Doe" required error={errors.name?.message} {...register('name')} />
          <Input id="email" label="Email address" type="text" placeholder="you@example.com" required error={errors.email?.message} {...register('email')} />
          <Input id="password" label="Password" type="password" placeholder="••••••••" required error={errors.password?.message} {...register('password')} />
          <Input id="confirm" label="Confirm password" type="password" placeholder="••••••••" required error={errors.confirm?.message} {...register('confirm')} />
          <Button type="submit" disabled={isSubmitting} className="mt-1">
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
          {errors.root && <p className="text-xs text-red-400 text-center">{errors.root.message}</p>}
        </form>
      </CardContent>

      <CardFooter>
        <p className="text-xs text-secondary w-full text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </CardFooter>

    </Card>
  )
}
