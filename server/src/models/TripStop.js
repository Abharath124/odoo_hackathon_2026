// models/TripStop.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const TripStop = sequelize.define(
  "TripStop",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    tripId: {
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

    arrivalDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    departureDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    stopOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = TripStop;
