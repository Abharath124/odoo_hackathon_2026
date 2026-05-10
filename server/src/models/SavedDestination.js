// models/SavedDestination.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SavedDestination = sequelize.define(
  "SavedDestination",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    cityName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = SavedDestination;
