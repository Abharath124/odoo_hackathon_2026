const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Trip = sequelize.define('Trip', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('planned', 'ongoing', 'completed', 'cancelled'),
    defaultValue: 'planned',
  },
  budget: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  groupSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  timestamps: true,
})

module.exports = Trip
