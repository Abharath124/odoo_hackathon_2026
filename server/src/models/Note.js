// models/Note.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Note = sequelize.define(
  "Note",
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

    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    noteText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    dayNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    stopId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = Note;
