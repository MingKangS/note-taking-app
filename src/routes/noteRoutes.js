const express = require("express");
const {
  createNote,
  getAllNotes,
  getNoteById,
} = require("../controllers/noteController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createNote);
router.get("/", authMiddleware, getAllNotes);
router.get("/:id", authMiddleware, getNoteById); // Route to get a note by ID

module.exports = router;
