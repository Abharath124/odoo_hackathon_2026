// models/AiGeneratedItinerary.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const AiGeneratedItinerary = sequelize.define(
  "AiGeneratedItinerary",
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

    prompt: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    generatedResponse: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = AiGeneratedItinerary;
