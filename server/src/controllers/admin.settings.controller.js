const Setting = require('../models/Setting')
const { getAllSettings, DEFAULTS } = require('../utils/settings')

const getSettings = async (req, res) => {
  try {
    const settings = await getAllSettings()
    // mask sensitive fields for response
    const masked = { ...settings }
    if (masked.smtp_pass) masked.smtp_pass = '••••••••'
    if (masked.jwt_secret) masked.jwt_secret = '••••••••'
    res.json({ settings: masked })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const updateSettings = async (req, res) => {
  try {
    const allowed = Object.keys(DEFAULTS)
    const updates = Object.entries(req.body)
      .filter(([key, value]) => allowed.includes(key) && value !== '••••••••')

    await Promise.all(
      updates.map(([key, value]) => Setting.upsert({ key, value: String(value) }))
    )
    res.json({ message: 'Settings updated successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// public — only expose non-sensitive fields
const getPublicSettings = async (req, res) => {
  try {
    const settings = await getAllSettings()
    res.json({
      site_name: settings.site_name,
      site_tagline: settings.site_tagline,
      primary_color: settings.primary_color,
      secondary_color: settings.secondary_color,
      logo: settings.logo,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const uploadLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
    const logoUrl = `/uploads/${req.file.filename}`
    await Setting.upsert({ key: 'logo', value: logoUrl })
    res.json({ message: 'Logo uploaded', logo: logoUrl })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { getSettings, updateSettings, getPublicSettings, uploadLogo }
