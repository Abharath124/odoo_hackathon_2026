import { PublicNav, PublicFooter } from '../components/PublicLayout'

const sections = [
  { title: '1. Information We Collect', content: 'We collect information you provide directly, such as your name, email address, and password when you register. We also collect usage data such as login times and activity logs to improve our service.' },
  { title: '2. How We Use Your Information', content: 'We use your information to provide and improve our services, send verification emails and OTPs, respond to your requests, and ensure the security of your account.' },
  { title: '3. Data Storage & Security', content: 'Your data is stored securely using industry-standard encryption. Passwords are hashed and never stored in plain text. We use JWT tokens for secure session management.' },
  { title: '4. Sharing of Information', content: 'We do not sell, trade, or rent your personal information to third parties. We may share data with trusted service providers who assist in operating our platform, subject to confidentiality agreements.' },
  { title: '5. Cookies', content: 'We use local storage to maintain your session. We do not use tracking cookies or third-party advertising cookies.' },
  { title: '6. Your Rights', content: 'You have the right to access, update, or delete your personal information at any time. You may also request a copy of the data we hold about you by contacting us.' },
  { title: '7. Changes to This Policy', content: 'We may update this Privacy Policy periodically. We will notify you of significant changes via email or a notice on our platform.' },
]

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicNav />

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-primary tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-secondary mt-2">Last updated: January 2026</p>
        </div>
        <div className="flex flex-col gap-8">
          {sections.map(({ title, content }) => (
            <div key={title}>
              <h2 className="text-sm font-semibold text-primary mb-2">{title}</h2>
              <p className="text-sm text-secondary leading-relaxed">{content}</p>
            </div>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
