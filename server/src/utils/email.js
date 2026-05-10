const { getTransporter } = require('../config/mailer')
const { getSetting } = require('./settings')

const sendOtpEmail = async (to, otp) => {
  const transporter = await getTransporter()
  const from = await getSetting('smtp_from')
  const siteName = await getSetting('site_name')
  const primaryColor = await getSetting('primary_color')

  await transporter.sendMail({
    from: `"${siteName}" <${from}>`,
    to,
    subject: 'Your verification OTP',
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:auto">
        <h2 style="color:${primaryColor}">${siteName} — Verify your email</h2>
        <p style="color:#71717a">Use the OTP below to complete your registration. It expires in 10 minutes.</p>
        <div style="font-size:32px;font-weight:600;letter-spacing:8px;color:${primaryColor};margin:24px 0">${otp}</div>
        <p style="color:#a1a1aa;font-size:12px">If you didn't request this, ignore this email.</p>
      </div>
    `,
  })
}

const sendResetEmail = async (to, otp) => {
  const transporter = await getTransporter()
  const from = await getSetting('smtp_from')
  const siteName = await getSetting('site_name')
  const primaryColor = await getSetting('primary_color')

  await transporter.sendMail({
    from: `"${siteName}" <${from}>`,
    to,
    subject: 'Reset your password',
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:auto">
        <h2 style="color:${primaryColor}">${siteName} — Reset password</h2>
        <p style="color:#71717a">Use the OTP below to reset your password. It expires in 10 minutes.</p>
        <div style="font-size:32px;font-weight:600;letter-spacing:8px;color:${primaryColor};margin:24px 0">${otp}</div>
        <p style="color:#a1a1aa;font-size:12px">If you didn't request this, ignore this email.</p>
      </div>
    `,
  })
}

module.exports = { sendOtpEmail, sendResetEmail }
