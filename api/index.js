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

// ðŸ”’ ALWAYS resolve relative to this file (cci/api/index.js)
const UPLOADS_DIR = path.resolve(__dirname, 'uploads')
/* -------------------- STATIC FILES -------------------- */
app.use('/cci/uploads', express.static(UPLOADS_DIR))      // old URLs

// Serve the frontend from the repo root (../) on the same port.
const FRONTEND_DIR = path.resolve(__dirname, '..')
app.get('/cci/api', (req, res) => {
  res.json({ message: "CCI API running fine" })
})

// ensure uploads dir exists
fs.mkdirSync(UPLOADS_DIR, { recursive: true })

/* -------------------- MULTER -------------------- */

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const ts = Date.now()
    cb(null, `upload_${ts}_${Math.round(Math.random() * 1e6)}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
})

function isImage(mimetype) {
  return mimetype?.startsWith('image/')
}

/* -------------------- HELPERS -------------------- */

function fileUrl(req, filename) {
  // Use BASE_URL from environment if available, otherwise construct from request
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`
  return `${baseUrl}/cci/api/uploads/${encodeURIComponent(filename)}`
}



/* -------------------- ROUTES -------------------- */

const articlesRouter = require('./routes/articles')
app.use('/cci/api/articles', articlesRouter)

const filesRouter = require('./routes/files')
app.use('/cci/api/files', filesRouter)

const volunteersRouter = require('./routes/volunteers')
app.use('/cci/api/volunteers', volunteersRouter)

const userRouter = require('./routes/user')
app.use('/cci/api/user', userRouter)

const carouselRouter = require('./routes/carousel')
app.use('/cci/api/carousel', carouselRouter)

const partnerRouter = require('./routes/partner')
app.use('/cci/api/partner', partnerRouter)

const titrerRouter = require('./routes/titre')
app.use('/cci/api/titre', titrerRouter)

const comitardRouter = require('./routes/comitard')
app.use('/cci/api/comitard', comitardRouter)

/* -------------------- UPLOAD -------------------- */

app.post('/cci/api/upload', upload.array('files'), async (req, res) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
        urls: []
      })
    }

    const results = []

    for (const f of req.files) {
      const originalPath = f.path
      const ext = path.extname(f.filename).toLowerCase()

      if (isImage(f.mimetype)) {
        const outName = `opt_${path.basename(f.filename, ext)}.jpg`
        const outPath = path.join(UPLOADS_DIR, outName)

        try {
          await sharp(originalPath)
            .resize({ width: 1920, withoutEnlargement: true })
            .jpeg({ quality: 75, mozjpeg: true })
            .toFile(outPath)

          fs.unlinkSync(originalPath)

          results.push({
            filename: outName,
            url: fileUrl(req, outName),
            optimized: true
          })
        } catch {
          results.push({
            filename: f.filename,
            url: fileUrl(req, f.filename),
            optimized: false
          })
        }
      } else {
        results.push({
          filename: f.filename,
          url: fileUrl(req, f.filename),
          optimized: false
        })
      }
    }

    res.json({
      success: true,
      message: 'Files uploaded',
      urls: results.map(r => r.url),
      details: results
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: err.message
    })
  }
})

/* -------------------- FRONTEND -------------------- */

// If an API path isn't matched, stop here so static doesn't leak backend files.
app.use('/cci/api', (req, res) => {
  res.status(404).json({ message: 'Not found' })
})

// Serve the frontend under /cci
app.use(
  '/cci',
  (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: 'Not found' })
    }
    return next()
  },
  express.static(FRONTEND_DIR)
)

app.get('/', (req, res) => {
  res.redirect('/cci/')
})

/* -------------------- START -------------------- */

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`)
})

console.log('UPLOADS_DIR =>', UPLOADS_DIR)
