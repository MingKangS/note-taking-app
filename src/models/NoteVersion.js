const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Note = require("./Note");

const NoteVersion = sequelize.define(
  "NoteVersion",
  {
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    noteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: Note,
        key: "id",
      },
    },
  },
  {
    indexes: [
      {
        type: "FULLTEXT",
        fields: ["content"],
      },
      {
        fields: ["noteId"],
      },
    ],
  }
);

Note.hasMany(NoteVersion, { foreignKey: "noteId", onDelete: "CASCADE" });
NoteVersion.belongsTo(Note, { foreignKey: "noteId" });

module.exports = NoteVersion;
