const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist
const uploadDirs = {
    pdf: "uploads/materials/pdf",
    images: "uploads/questions/images",
    audio: "uploads/questions/audio",
};

Object.values(uploadDirs).forEach((dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure storage for PDF files
const pdfStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirs.pdf);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "pdf-" + uniqueSuffix + path.extname(file.originalname));
    },
});

// Configure storage for image files
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirs.images);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "img-" + uniqueSuffix + path.extname(file.originalname));
    },
});

// Configure storage for audio files
const audioStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirs.audio);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "audio-" + uniqueSuffix + path.extname(file.originalname));
    },
});

// File filters
const pdfFilter = (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files are allowed"), false);
    }
};

const imageFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/gif" ||
        file.mimetype === "image/webp"
    ) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed (JPEG, PNG, GIF, WebP)"), false);
    }
};

const audioFilter = (req, file, cb) => {
    if (
        file.mimetype === "audio/mpeg" ||
        file.mimetype === "audio/mp3" ||
        file.mimetype === "audio/wav" ||
        file.mimetype === "audio/ogg" ||
        file.mimetype === "audio/webm"
    ) {
        cb(null, true);
    } else {
        cb(new Error("Only audio files are allowed (MP3, WAV, OGG, WebM)"), false);
    }
};

// Multer instances
const uploadPDF = multer({
    storage: pdfStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: pdfFilter,
});

const uploadImage = multer({
    storage: imageStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: imageFilter,
});

const uploadAudio = multer({
    storage: audioStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: audioFilter,
});

// Upload handlers
exports.uploadPDF = (req, res) => {
    uploadPDF.single("pdf")(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }
        res.json({
            success: true,
            url: `/uploads/materials/pdf/${req.file.filename}`,
            filename: req.file.filename,
        });
    });
};

exports.uploadImage = (req, res) => {
    uploadImage.single("image")(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }
        res.json({
            success: true,
            url: `/uploads/questions/images/${req.file.filename}`,
            filename: req.file.filename,
        });
    });
};

exports.uploadAudio = (req, res) => {
    uploadAudio.single("audio")(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }
        res.json({
            success: true,
            url: `/uploads/questions/audio/${req.file.filename}`,
            filename: req.file.filename,
        });
    });
};



