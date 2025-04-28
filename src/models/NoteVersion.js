const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Note = require("./Note");

const NoteVersion = sequelize.define(
  "NoteVersion",
  {
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    noteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    primaryKey: ["noteId", "version"],
  }
);

Note.hasMany(NoteVersion, { foreignKey: "noteId", onDelete: "CASCADE" });
NoteVersion.belongsTo(Note, { foreignKey: "noteId" });

module.exports = NoteVersion;
