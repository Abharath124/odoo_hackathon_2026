require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') })
const sequelize = require('../config/db')
const Setting = require('../models/Setting')
const { DEFAULTS } = require('../utils/settings')

const seedSettings = async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync({ alter: true })

    const seeds = {
      ...DEFAULTS,
      // override with required values that must be set
      jwt_secret: process.env.JWT_SECRET || 'travelloop_jwt_secret_2026',
      jwt_expires_in: '7d',
      smtp_host: process.env.SMTP_HOST || '',
      smtp_port: process.env.SMTP_PORT || '587',
      smtp_user: process.env.SMTP_USER || '',
      smtp_pass: process.env.SMTP_PASS || '',
      smtp_from: process.env.SMTP_FROM || '',
    }

    let created = 0
    let skipped = 0

    for (const [key, value] of Object.entries(seeds)) {
      const exists = await Setting.findByPk(key)
      if (!exists) {
        await Setting.create({ key, value: String(value) })
        created++
        console.log(`  ✓ Created: ${key} = ${['smtp_pass', 'jwt_secret'].includes(key) ? '••••••••' : value}`)
      } else {
        skipped++
      }
    }

    console.log(`\nSettings seeded: ${created} created, ${skipped} already exist`)
    process.exit(0)
  } catch (err) {
    console.error('Seeder failed:', err.message)
    process.exit(1)
  }
}

seedSettings()
