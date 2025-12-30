const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')
const cors = require('cors')

require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5000
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads')

// ensure uploads dir exists
fs.mkdirSync(UPLOADS_DIR, { recursive: true })

// Multer storage to save original files first
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const ts = Date.now()
    cb(null, `upload_${ts}_${Math.round(Math.random()*1e6)}${ext}`)
  }
})
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } })

function isImage(mimetype) {
  return mimetype && mimetype.startsWith('image/')
}

// Helper to build public URL
function fileUrl(req, filename) {
  const protocol = req.protocol
  const host = req.get('host')
  return `${protocol}://${host}/uploads/${encodeURIComponent(filename)}`
}

// Serve uploads statically
app.use('/uploads', express.static(UPLOADS_DIR))

// Simple health
app.get('/api/health', (req, res) => res.json({ ok: true }))

// Mount article routes
const articlesRouter = require('./routes/articles')
app.use('/api/articles', articlesRouter)

// Mount files router
const filesRouter = require('./routes/files')
app.use('/api/files', filesRouter)

// POST /api/upload - accept multiple files under field name 'files'
app.post('/api/upload', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || !req.files.length) return res.status(400).json({ success: false, message: 'No files uploaded', urls: [] })

    const results = []

    for (const f of req.files) {
      const originalPath = f.path
      const ext = path.extname(f.filename).toLowerCase()
      if (isImage(f.mimetype)) {
        // optimize image with sharp -> create jpg optimized
        const outName = `opt_${path.basename(f.filename, ext)}.jpg`
        const outPath = path.join(UPLOADS_DIR, outName)
        try {
          await sharp(originalPath)
            .resize({ width: 1920, withoutEnlargement: true })
            .jpeg({ quality: 75, mozjpeg: true })
            .toFile(outPath)

          // remove original
          try { fs.unlinkSync(originalPath) } catch (e) {}

          results.push({ filename: outName, url: fileUrl(req, outName), optimized: true })
        } catch (err) {
          // fallback: keep original
          results.push({ filename: f.filename, url: fileUrl(req, f.filename), optimized: false })
        }
      } else {
        // For non-image (video etc) we simply keep the original file
        results.push({ filename: f.filename, url: fileUrl(req, f.filename), optimized: false })
      }
    }

    return res.json({ success: true, message: 'Files uploaded', urls: results.map(r => r.url), details: results })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: 'Upload failed', error: err.message })
  }
})

app.listen(PORT, () => console.log(`API server listening on http://localhost:${PORT}`))
