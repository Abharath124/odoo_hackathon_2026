const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString()

const otpExpiresAt = () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

module.exports = { generateOtp, otpExpiresAt }
