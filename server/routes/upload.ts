import express from "express";
import { videoUpload, mediaUpload } from "../middleware/upload";

const router = express.Router();

router.post("/lobby-video", (req, res) => {
  videoUpload.single('video')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Upload failed." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No video file received." });
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename, size: req.file.size });
  });
});

router.post("/media", (req, res) => {
  mediaUpload.single('media')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Upload failed." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file received." });
    }
    // Determine the base protocol + host dynamically to return an absolute URL
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol || 'http';
    const url = `${protocol}://${host}/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename, size: req.file.size });
  });
});

export default router;
