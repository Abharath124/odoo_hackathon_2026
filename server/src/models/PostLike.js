const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const PostLike = sequelize.define('PostLike', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  timestamps: true,
})

module.exports = PostLike
