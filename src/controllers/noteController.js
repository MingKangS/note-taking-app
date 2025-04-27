const Note = require("../models/Note");

const createNote = async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.userId;
  try {
    const note = await Note.create({ title, content, userId });
    res.status(201).json({ message: "Note created successfully", note });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllNotes = async (req, res) => {
  const userId = req.user.userId; // Assuming `req.user` contains the authenticated user's ID
  try {
    const notes = await Note.findAll({ where: { userId } });
    res.status(200).json({ notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createNote, getAllNotes };
