const nodemailer = require('nodemailer')

const getTransporter = async () => {
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS

  if (!user || !pass) {
    console.error('[getTransporter] Missing EMAIL_USER or EMAIL_PASS in .env')
    throw new Error('Email credentials not configured in .env')
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  })
}

module.exports = { getTransporter }
