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

    noteText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = Note;
