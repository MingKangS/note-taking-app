const Note = require("../models/Note");
const NoteVersion = require("../models/NoteVersion");
const { Op } = require("sequelize");
const redisClient = require("../config/redis");

const createNote = async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.userId;

  try {
    const note = await Note.create({ title, userId });
    await NoteVersion.create({ version: 1, content, noteId: note.id });

    const cacheKey = `getAllNotes:${userId}`;
    await redisClient.del(cacheKey);

    res.status(201).json({ message: "Note created successfully", note });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllNotes = async (req, res) => {
  const userId = req.user.userId;

  try {
    const cacheKey = `getAllNotes:${userId}`;
    const cachedNotes = await redisClient.get(cacheKey);

    if (cachedNotes) {
      return res.status(200).json({ notes: JSON.parse(cachedNotes) });
    }

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

    await redisClient.setEx(cacheKey, 60 * 60 * 24 * 30, JSON.stringify(notes));

    res.status(200).json({ notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getNoteById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const cacheKey = `getNoteById:${id}`;
    const cachedNote = await redisClient.get(cacheKey);

    if (cachedNote) {
      return res.status(200).json({ note: JSON.parse(cachedNote) });
    }

    const note = await Note.findOne({
      where: { id },
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

    if (note.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Access denied: Unauthorized user" });
    }

    await redisClient.setEx(cacheKey, 60 * 60 * 24 * 30, JSON.stringify(note));

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
    const note = await Note.findOne({ where: { id } });
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    if (note.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Access denied: Unauthorized user" });
    }

    const newVersion = latestVersion.version + 1;
    await NoteVersion.create({ version: newVersion, content, noteId: id });

    if (title) {
      note.title = title;
      await note.save();
    }

    await redisClient.del(`getAllNotes:${userId}`);
    await redisClient.del(`getNoteById:${id}`);

    res.status(200).json({ message: "Note updated successfully", newVersion });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        error:
          "Conflict: A version with the same noteId and version already exists.",
      });
    }
    res.status(500).json({ error: error.message });
  }
};

const softDeleteNote = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const note = await Note.findOne({ where: { id } });
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    if (note.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Access denied: Unauthorized user" });
    }

    note.isDeleted = true;
    await note.save();

    await redisClient.del(`getAllNotes:${userId}`);
    await redisClient.del(`getNoteById:${id}`);

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const searchNotes = async (req, res) => {
  const { keyword } = req.query;
  const userId = req.user.userId;

  try {
    if (!keyword) {
      return res.status(400).json({ error: "Keyword is required for search" });
    }

    const notes = await Note.findAll({
      where: { userId, isDeleted: false },
      include: [
        {
          model: NoteVersion,
          attributes: ["version", "content"],
          where: Sequelize.literal(
            `MATCH(content) AGAINST(:keyword IN NATURAL LANGUAGE MODE)`
          ),
          replacements: { keyword },
        },
      ],
    });

    res.status(200).json({ notes });
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
  searchNotes,
};
