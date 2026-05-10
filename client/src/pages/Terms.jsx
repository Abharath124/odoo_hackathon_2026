import { PublicNav, PublicFooter } from '../components/PublicLayout'

const sections = [
  { title: '1. Acceptance of Terms', content: 'By accessing or using Workspace, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our service.' },
  { title: '2. Use of Service', content: 'You agree to use Workspace only for lawful purposes. You must not use the service in any way that violates applicable local, national, or international laws or regulations.' },
  { title: '3. Account Registration', content: 'To access certain features, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.' },
  { title: '4. Intellectual Property', content: 'All content, features, and functionality of Workspace are owned by us and are protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.' },
  { title: '5. Termination', content: 'We reserve the right to suspend or terminate your account at any time for violations of these terms or for any other reason at our sole discretion.' },
  { title: '6. Limitation of Liability', content: 'Workspace is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.' },
  { title: '7. Changes to Terms', content: 'We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.' },
]

export default function Terms() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicNav />

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-primary tracking-tight">Terms & Conditions</h1>
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
