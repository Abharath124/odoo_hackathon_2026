// models/Activity.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Activity = sequelize.define(
  "Activity",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    stopId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    activityName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    activityDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    activityTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },

    estimatedCost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = Activity;
