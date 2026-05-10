import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import api from '../utils/api'
import BrandLogo from '../components/BrandLogo'

const emailSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
})

const resetSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
  password: z.string().min(8, 'Minimum 8 characters'),
  confirm: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
})

export default function ResetPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')

  const emailForm = useForm({ resolver: zodResolver(emailSchema) })
  const resetForm = useForm({ resolver: zodResolver(resetSchema) })

  const onSendOtp = async (data) => {
    try {
      await api.post('/auth/forgot-password', { email: data.email })
      setEmail(data.email)
      setStep(2)
    } catch (err) {
      emailForm.setError('root', { message: err.response?.data?.message || 'Failed to send OTP' })
    }
  }

  const onResetPassword = async (data) => {
    try {
      await api.post('/auth/reset-password', { email, otp: data.otp, password: data.password })
      navigate('/login')
    } catch (err) {
      resetForm.setError('root', { message: err.response?.data?.message || 'Reset failed' })
    }
  }

  return (
    <Card className="max-w-sm w-full">

      <CardHeader>
        <div className="mb-4"><BrandLogo size="md" /></div>
        <CardTitle description={step === 1 ? 'Enter your email to receive a reset OTP' : `Enter the OTP sent to ${email}`}>
          {step === 1 ? 'Reset password' : 'Set new password'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {step === 1 ? (
          <form onSubmit={emailForm.handleSubmit(onSendOtp)} className="flex flex-col gap-4">
            <Input id="email" label="Email address" type="text" placeholder="you@example.com" required error={emailForm.formState.errors.email?.message} {...emailForm.register('email')} />
            <Button type="submit" disabled={emailForm.formState.isSubmitting} className="mt-1">
              {emailForm.formState.isSubmitting ? 'Sending...' : 'Send OTP'}
            </Button>
            {emailForm.formState.errors.root && (
              <p className="text-xs text-red-400 text-center">{emailForm.formState.errors.root.message}</p>
            )}
          </form>
        ) : (
          <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="flex flex-col gap-4">
            <Input id="otp" label="OTP" type="text" placeholder="123456" maxLength={6} required error={resetForm.formState.errors.otp?.message} {...resetForm.register('otp')} />
            <Input id="password" label="New password" type="password" placeholder="••••••••" required error={resetForm.formState.errors.password?.message} {...resetForm.register('password')} />
            <Input id="confirm" label="Confirm password" type="password" placeholder="••••••••" required error={resetForm.formState.errors.confirm?.message} {...resetForm.register('confirm')} />
            <Button type="submit" disabled={resetForm.formState.isSubmitting} className="mt-1">
              {resetForm.formState.isSubmitting ? 'Resetting...' : 'Reset password'}
            </Button>
            {resetForm.formState.errors.root && (
              <p className="text-xs text-red-400 text-center">{resetForm.formState.errors.root.message}</p>
            )}
          </form>
        )}
      </CardContent>

      <CardFooter>
        <p className="text-xs text-secondary w-full text-center">
          Remembered your password?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </CardFooter>

    </Card>
  )
}
