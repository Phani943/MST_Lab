const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

const conn = mongoose.connection;
let gridBucket;

// Initialize GridFSBucket
conn.once("open", () => {
    gridBucket = new GridFSBucket(conn.db, { bucketName: "pdfs" });
});

// Multer Storage (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Upload PDF
router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
    try {
        if (!req.file || req.file.mimetype !== "application/pdf") {
            return res.status(400).json({ message: "Only PDF files are allowed" });
        }

        const writeStream = gridBucket.openUploadStream(req.file.originalname, {
            contentType: "application/pdf",
        });

        writeStream.end(req.file.buffer);

        writeStream.on("finish", () => {
            res.status(201).json({ message: "File uploaded successfully", file_id: writeStream.id.toString() });
        });

        writeStream.on("error", (err) => {
            console.error("Upload Error:", err);
            res.status(500).json({ message: "File upload failed" });
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ✅ Retrieve PDF by filename
router.get("/download/:filename", authMiddleware, async (req, res) => {
    try {
        const files = await conn.db.collection("pdfs.files").find({ filename: req.params.filename }).toArray();
        
        if (!files || files.length === 0) {
            return res.status(404).json({ message: "File not found" });
        }

        const file = files[0]; // Get the first matched file
        const readStream = gridBucket.openDownloadStream(file._id);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);
        readStream.pipe(res);

    } catch (error) {
        console.error("Download Error:", error);
        res.status(500).json({ message: "Error retrieving file" });
    }
});

module.exports = router;
