import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import api from '../utils/api'
import { setCredentials } from '../store/authSlice'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required').min(8, 'Minimum 8 characters'),
})

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/auth/login', data)
      dispatch(setCredentials({ user: res.data.user, token: res.data.token }))
      navigate(res.data.user.role === 'admin' ? '/admin/dashboard' : '/home')
    } catch (err) {
      setError('root', { message: err.response?.data?.message || 'Invalid credentials' })
    }
  }

  return (
    <Card className="max-w-sm w-full">

      <CardHeader>
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center mb-4">
          <span className="text-white text-sm">⬡</span>
        </div>
        <CardTitle description="Sign in to your account">Welcome back</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            id="email"
            label="Email address"
            type="text"
            placeholder="you@example.com"
            required
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            required
            error={errors.password?.message}
            rightLabel={
              <Link to="/reset-password" className="text-xs text-secondary hover:text-primary transition-colors">
                Forgot password?
              </Link>
            }
            {...register('password')}
          />
          <Button type="submit" disabled={isSubmitting} className="mt-1">
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
          {errors.root && <p className="text-xs text-red-400 text-center">{errors.root.message}</p>}
        </form>
      </CardContent>

      <CardFooter>
        <p className="text-xs text-secondary w-full text-center">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-semibold hover:underline">Sign up</Link>
        </p>
      </CardFooter>

    </Card>
  )
}
