require('dotenv').config()
const express = require('express')
const cors = require('cors')
const sequelize = require('./src/config/db')
const Setting = require('./src/models/Setting')
const { DEFAULTS } = require('./src/utils/settings')

const authRoutes = require('./src/routes/auth.routes')
const adminRoutes = require('./src/routes/admin.routes')
const userRoutes = require('./src/routes/user.routes')
const tripRoutes = require('./src/routes/trip.routes')
const destinationRoutes = require('./src/routes/destination.routes')
const activityRoutes = require('./src/routes/activity.routes')
const itineraryRoutes = require('./src/routes/itinerary.routes')
const searchRoutes = require('./src/routes/search.routes')
const budgetRoutes = require('./src/routes/budget.routes')
const checklistRoutes = require('./src/routes/checklist.routes')
const notesRoutes = require('./src/routes/notes.routes')
const invoiceRoutes = require('./src/routes/invoice.routes')

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())
app.use('/uploads', express.static('uploads'))

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/users', userRoutes)
app.use('/api/trips', tripRoutes)
app.use('/api/destinations', destinationRoutes)
app.use('/api/activities', activityRoutes)
app.use('/api/itineraries', itineraryRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/budget', budgetRoutes)
app.use('/api/checklist', checklistRoutes)
app.use('/api/notes', notesRoutes)
app.use('/api/invoices', invoiceRoutes)

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
