const { getTransporter } = require('../config/mailer')
const { getSetting } = require('./settings')

const sendOtpEmail = async (to, otp) => {
  try {
    const transporter = await getTransporter()
    const siteName = await getSetting('site_name') || 'TravelLoop'
    const primaryColor = await getSetting('primary_color') || '#18181b'

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: `${siteName} - Email Verification`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, ${primaryColor} 0%, #27272a 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
              .header p { margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .otp-box { background: white; border: 2px solid ${primaryColor}; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
              .otp-code { font-size: 36px; font-weight: 700; letter-spacing: 8px; color: ${primaryColor}; font-family: 'Courier New', monospace; }
              .otp-label { font-size: 12px; color: #71717a; margin-top: 10px; }
              .message { color: #52525b; font-size: 14px; line-height: 1.8; }
              .footer { text-align: center; padding: 20px; color: #a1a1aa; font-size: 12px; border-top: 1px solid #e4e4e7; margin-top: 20px; }
              .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 4px; font-size: 13px; color: #92400e; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✈️ ${siteName}</h1>
                <p>Travel Management System</p>
              </div>
              <div class="content">
                <p class="message">Hello,</p>
                <p class="message">Welcome to ${siteName}! To verify your email address and complete your registration, please use the verification code below:</p>
                
                <div class="otp-box">
                  <div class="otp-code">${otp}</div>
                  <div class="otp-label">Valid for 10 minutes</div>
                </div>
                
                <p class="message">This code will expire in <strong>10 minutes</strong>. If you didn't request this verification, please ignore this email.</p>
                
                <div class="warning">
                  🔒 <strong>Security Tip:</strong> Never share this code with anyone. ${siteName} staff will never ask for your verification code.
                </div>
                
                <p class="message" style="margin-top: 25px; color: #71717a; font-size: 13px;">
                  Need help? Contact our support team at <a href="mailto:support@travelloop.com" style="color: ${primaryColor}; text-decoration: none;">support@travelloop.com</a>
                </p>
              </div>
              <div class="footer">
                <p>© 2026 ${siteName} - Travel Management System. All rights reserved.</p>
                <p>This is an automated message, please do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })
  } catch (err) {
    console.error('[sendOtpEmail error]', err)
    throw err
  }
}

const sendResetEmail = async (to, otp) => {
  try {
    const transporter = await getTransporter()
    const siteName = await getSetting('site_name') || 'TravelLoop'
    const primaryColor = await getSetting('primary_color') || '#18181b'

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: `${siteName} - Password Reset Request`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, ${primaryColor} 0%, #27272a 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
              .header p { margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .otp-box { background: white; border: 2px solid ${primaryColor}; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
              .otp-code { font-size: 36px; font-weight: 700; letter-spacing: 8px; color: ${primaryColor}; font-family: 'Courier New', monospace; }
              .otp-label { font-size: 12px; color: #71717a; margin-top: 10px; }
              .message { color: #52525b; font-size: 14px; line-height: 1.8; }
              .footer { text-align: center; padding: 20px; color: #a1a1aa; font-size: 12px; border-top: 1px solid #e4e4e7; margin-top: 20px; }
              .warning { background: #fee2e2; border-left: 4px solid #ef4444; padding: 12px; border-radius: 4px; font-size: 13px; color: #7f1d1d; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✈️ ${siteName}</h1>
                <p>Travel Management System</p>
              </div>
              <div class="content">
                <p class="message">Hello,</p>
                <p class="message">We received a request to reset your password for your ${siteName} account. Use the code below to reset your password:</p>
                
                <div class="otp-box">
                  <div class="otp-code">${otp}</div>
                  <div class="otp-label">Valid for 10 minutes</div>
                </div>
                
                <p class="message">This code will expire in <strong>10 minutes</strong>. If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
                
                <div class="warning">
                  ⚠️ <strong>Important:</strong> Never share this code with anyone. ${siteName} staff will never ask for your reset code.
                </div>
                
                <p class="message" style="margin-top: 25px; color: #71717a; font-size: 13px;">
                  Having trouble? Contact our support team at <a href="mailto:support@travelloop.com" style="color: ${primaryColor}; text-decoration: none;">support@travelloop.com</a>
                </p>
              </div>
              <div class="footer">
                <p>© 2026 ${siteName} - Travel Management System. All rights reserved.</p>
                <p>This is an automated message, please do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })
  } catch (err) {
    console.error('[sendResetEmail error]', err)
    throw err
  }
}

module.exports = { sendOtpEmail, sendResetEmail }
