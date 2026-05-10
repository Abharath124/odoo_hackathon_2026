const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Setting = sequelize.define('Setting', {
  key: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
})

module.exports = Setting
