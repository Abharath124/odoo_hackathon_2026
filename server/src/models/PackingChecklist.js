// models/PackingChecklist.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PackingChecklist = sequelize.define(
  "PackingChecklist",
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

    itemName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    isPacked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = PackingChecklist;
