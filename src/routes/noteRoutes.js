const express = require("express");
const {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  softDeleteNote,
  searchNotes,
} = require("../controllers/noteController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createNote);
router.get("/", authMiddleware, getAllNotes);
router.get("/search", authMiddleware, searchNotes);
router.get("/:id", authMiddleware, getNoteById);
router.put("/:id", authMiddleware, updateNote);
router.delete("/:id", authMiddleware, softDeleteNote);

module.exports = router;
