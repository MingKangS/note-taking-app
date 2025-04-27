const Note = require("../models/Note");
const NoteVersion = require("../models/NoteVersion");

const createNote = async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.userId;

  try {
    const note = await Note.create({ title, userId });
    await NoteVersion.create({ version: 1, content, noteId: note.id });
    res.status(201).json({ message: "Note created successfully", note });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllNotes = async (req, res) => {
  const userId = req.user.userId;

  try {
    const notes = await Note.findAll({
      where: { userId, isDeleted: false },
      include: [
        {
          model: NoteVersion,
          attributes: ["version", "content"],
          order: [["version", "DESC"]],
          limit: 1,
        },
      ],
    });

    res.status(200).json({ notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getNoteById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const note = await Note.findOne({
      where: { id, userId },
      include: [
        {
          model: NoteVersion,
          attributes: ["version", "content"],
          order: [["version", "ASC"]],
        },
      ],
    });

    if (!note || note.isDeleted) {
      return res
        .status(404)
        .json({ error: "Note not found or has been deleted" });
    }

    res.status(200).json({ note });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateNote = async (req, res) => {
  const { id } = req.params;
  const { title, content, version } = req.body;
  const userId = req.user.userId;

  try {
    const note = await Note.findOne({ where: { id, userId } });
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    const latestVersion = await NoteVersion.findOne({
      where: { noteId: id },
      order: [["version", "DESC"]],
    });

    if (version !== latestVersion.version) {
      return res.status(409).json({
        error: "Conflict: The note has been updated by someone else.",
        latestVersion: latestVersion.version,
      });
    }

    if (title) {
      note.title = title;
      await note.save();
    }

    const newVersion = latestVersion.version + 1;
    await NoteVersion.create({ version: newVersion, content, noteId: id });

    res.status(200).json({ message: "Note updated successfully", newVersion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const softDeleteNote = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const note = await Note.findOne({ where: { id, userId } });
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    note.isDeleted = true;
    await note.save();

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  softDeleteNote,
};
