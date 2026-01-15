const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const sharp = require('sharp')
const db = require('../models')
const { normalizeSequelizeError } = require('../tools/helper')


const FileModel = db.File

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads')
fs.mkdirSync(UPLOADS_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const ts = Date.now()
    cb(null, `upload_${ts}_${Math.round(Math.random() * 1e6)}${ext}`)
  }
})

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } })

function isImage(mimetype) { return mimetype && mimetype.startsWith('image/') }

function fileUrl(req, filename) {
  const protocol = req.protocol
  const host = req.get('host')
  return `${protocol}://${host}/uploads/${encodeURIComponent(filename)}`
}

// List files
router.get('/', async (req, res) => {
  try {
    const files = await FileModel.findAll({ order: [['created_at', 'DESC']], limit: 200 })
    res.json(files)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// Upload and create File records (not attached to article)
router.post('/', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || !req.files.length) return res.status(400).json({ error: 'No files uploaded' })
    const created = []
    for (const file of req.files) {
      const originalPath = file.path
      const ext = path.extname(file.filename).toLowerCase()
      let finalName = file.filename
      let optimized = false
      if (isImage(file.mimetype)) {
        const outName = `opt_${path.basename(file.filename, ext)}.webp`
        const outPath = path.join(UPLOADS_DIR, outName)
        try {
          await sharp(originalPath)
            .resize({ width: 1920, withoutEnlargement: true })
            .webp({ quality: 75 })
            .toFile(outPath)
          try { fs.unlinkSync(originalPath) } catch (e) { }
          finalName = outName
          optimized = true
        } catch (e) {
          // keep original
        }
      }
      const url = fileUrl(req, finalName)
      const rec = await FileModel.create({ filename: finalName, originalname: file.originalname, mime: file.mimetype, size: file.size, url, optimized })
      created.push({ id: rec.id, filename: finalName, url, optimized })
    }
    res.status(201).json({ files: created })
  } catch (err) {
    res.status(500).json({ error: normalizeSequelizeError(err) })
  }
})

// Delete file record (and optionally remove file)
router.delete('/:id', async (req, res) => {
  try {
    const rec = await FileModel.findByPk(req.params.id)
    if (!rec) return res.status(404).json({ error: 'Not found' })
    // attempt to delete file from disk
    const filename = rec.filename
    if (filename) {
      try { fs.unlinkSync(path.join(UPLOADS_DIR, filename)) } catch (e) { }
    }
    await rec.destroy()
    res.json({ deleted: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// Patch file record (update metadata like use_as)
router.patch('/:id', async (req, res) => {
  try {
    const rec = await FileModel.findByPk(req.params.id)
    if (!rec) return res.status(404).json({ error: 'Not found' })

    const { use_as } = req.body
    if (use_as !== undefined) {
      rec.use_as = use_as
    }

    await rec.save()
    res.json(rec)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: normalizeSequelizeError(err) })
  }
})

module.exports = router
