// models/SharedTrip.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SharedTrip = sequelize.define(
  "SharedTrip",
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

    shareToken: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = SharedTrip;
