import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import api from '../utils/api'
import { setCredentials } from '../store/authSlice'
import BrandLogo from '../components/BrandLogo'

const schema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
})

export default function VerifyOtp() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/auth/verify-otp', { email, otp: data.otp })
      dispatch(setCredentials({ user: res.data.user, token: res.data.token }))
      navigate(res.data.user.role === 'admin' ? '/admin/dashboard' : '/home')
    } catch (err) {
      setError('root', { message: err.response?.data?.message || 'Verification failed' })
    }
  }

  return (
    <Card className="max-w-sm w-full">

      <CardHeader>
        <div className="mb-4"><BrandLogo size="md" /></div>
        <CardTitle description={`Enter the 6-digit OTP sent to ${email}`}>
          Verify your email
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input id="otp" label="OTP" type="text" placeholder="123456" maxLength={6} required error={errors.otp?.message} {...register('otp')} />
          <Button type="submit" disabled={isSubmitting} className="mt-1">
            {isSubmitting ? 'Verifying...' : 'Verify & Sign in'}
          </Button>
          {errors.root && <p className="text-xs text-red-400 text-center">{errors.root.message}</p>}
        </form>
      </CardContent>

      <CardFooter>
        <p className="text-xs text-zinc-400 w-full text-center">
          Back to{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </CardFooter>

    </Card>
  )
}
