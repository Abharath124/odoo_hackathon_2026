require('dotenv').config()
const express = require('express')
const cors = require('cors')
const sequelize = require('./src/config/db')
const Setting = require('./src/models/Setting')
const { DEFAULTS } = require('./src/utils/settings')

const authRoutes = require('./src/routes/auth.routes')
const adminRoutes = require('./src/routes/admin.routes')
const tripRoutes = require('./src/routes/trip.routes')
const destinationRoutes = require('./src/routes/destination.routes')

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())
app.use('/uploads', express.static('uploads'))

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/trips', tripRoutes)
app.use('/api/destinations', destinationRoutes)

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 5000

const seedSettings = async () => {
  for (const [key, value] of Object.entries(DEFAULTS)) {
    if (!value || String(value).trim() === '') continue
    const exists = await Setting.findByPk(key)
    if (!exists) await Setting.create({ key, value: String(value) })
  }
  console.log('Settings seeded')
}

sequelize.sync({ alter: true }).then(async () => {
  console.log('Database synced')
  await seedSettings()
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}).catch((err) => console.error('DB connection failed:', err))
