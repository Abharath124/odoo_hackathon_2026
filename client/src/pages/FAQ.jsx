import { useState } from 'react'
import { PublicNav, PublicFooter } from '../components/PublicLayout'

const faqs = [
  { q: 'What is Travel Loop?', a: 'Travel Loop is a travel management platform for exploring and managing trips with your team. It is built with modern technologies and designed to be fast and easy to use.' },
  { q: 'How do I create an account?', a: 'Click "Get started" on the landing page, fill in your name, email and password. You will receive a 6-digit OTP on your email to verify your account before you can sign in.' },
  { q: 'I did not receive the OTP email. What should I do?', a: 'Check your spam or junk folder. If it is not there, try registering again. Make sure the email address you entered is correct.' },
  { q: 'How do I reset my password?', a: 'Click "Forgot password?" on the login page, enter your email address, and we will send you a 6-digit OTP. Enter the OTP along with your new password to reset it.' },
  { q: 'Is my data secure?', a: 'Yes. Passwords are hashed using bcrypt and never stored in plain text. Sessions are managed using JWT tokens. All sensitive operations require authentication.' },
  { q: 'What is the difference between admin and user roles?', a: 'Admin users have access to the admin panel where they can manage all users and system settings. Regular users have access to their personal Travel Loop dashboard.' },
  { q: 'How do I contact support?', a: 'You can reach us at support@travelloop.com. We typically respond within 24 hours on business days.' },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-zinc-100 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left gap-4">
        <span className="text-sm font-medium text-primary">{q}</span>
        <span className={`text-secondary text-lg shrink-0 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && <p className="text-sm text-secondary leading-relaxed pb-4">{a}</p>}
    </div>
  )
}

export default function FAQ() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicNav />

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-primary tracking-tight">Frequently Asked Questions</h1>
          <p className="text-sm text-secondary mt-2">Everything you need to know about Travel Loop.</p>
        </div>

        <div className="bg-white border border-zinc-100 rounded-2xl px-6">
          {faqs.map((item) => <FaqItem key={item.q} {...item} />)}
        </div>

        <div className="mt-10 bg-zinc-50 rounded-2xl px-6 py-6 text-center">
          <p className="text-sm text-secondary">Still have questions?</p>
          <a href="mailto:support@travelloop.com" className="text-sm font-medium text-primary hover:underline mt-1 inline-block">
            support@travelloop.com
          </a>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
