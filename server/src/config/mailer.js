const nodemailer = require('nodemailer')
const { getSetting } = require('../utils/settings')

const getTransporter = async () => {
  const host = await getSetting('smtp_host')
  const port = await getSetting('smtp_port')
  const user = await getSetting('smtp_user')
  const pass = await getSetting('smtp_pass')

  return nodemailer.createTransport({
    host,
    port: parseInt(port),
    secure: false,
    auth: { user, pass },
  })
}

module.exports = { getTransporter }
