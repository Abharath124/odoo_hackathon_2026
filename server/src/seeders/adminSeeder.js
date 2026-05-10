require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') })
const bcrypt = require('bcryptjs')
const sequelize = require('../config/db')
const User = require('../models/User')

const seedAdmin = async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync({ alter: true })

    const email = 'admin@travelloop.com'
    const password = 'password'
    const name = 'Admin'

    const existing = await User.findOne({ where: { email } })
    if (existing) {
      console.log(`Admin already exists: ${email}`)
      process.exit(0)
    }

    const hashed = await bcrypt.hash(password, 10)
    await User.create({
      name,
      email,
      password: hashed,
      role: 'admin',
      isVerified: true,
    })

    console.log(`✓ Admin seeded successfully`)
    console.log(`  Email   : ${email}`)
    console.log(`  Password: ${password}`)
    process.exit(0)
  } catch (err) {
    console.error('Seeder failed:', err.message)
    process.exit(1)
  }
}

seedAdmin()
