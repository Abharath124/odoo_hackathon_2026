const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const DayPlan = sequelize.define('DayPlan', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  itineraryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  dayNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
})

module.exports = DayPlan
