const Setting = require('../models/Setting')

const DEFAULTS = {
  site_name: 'TravelLoop',
  site_tagline: 'Explore the world, together.',
  primary_color: '#18181b',
  secondary_color: '#71717a',
  logo: '',
  smtp_host: '',
  smtp_port: '587',
  smtp_user: '',
  smtp_pass: '',
  smtp_from: '',
  jwt_secret: '',
  jwt_expires_in: '7d',
}

const getSetting = async (key) => {
  try {
    const row = await Setting.findByPk(key)
    if (row?.value && row.value.trim() !== '') return row.value
  } catch (_) {}
  return DEFAULTS[key] ?? null
}

const getAllSettings = async () => {
  const rows = await Setting.findAll()
  const settings = { ...DEFAULTS }
  rows.forEach(({ key, value }) => { if (value && value.trim() !== '') settings[key] = value })
  return settings
}

module.exports = { getSetting, getAllSettings, DEFAULTS }
