const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Setting = sequelize.define('Setting', {
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
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
