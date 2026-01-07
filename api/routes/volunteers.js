const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const sharp = require('sharp')
const db = require('../models')

const Volunteer = db.Volunteer
const FileModel = db.File

// uploads dir
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads')
fs.mkdirSync(UPLOADS_DIR, { recursive: true })

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        const ts = Date.now()
        cb(null, `volunteer_${ts}_${Math.round(Math.random() * 1e6)}${ext}`)
    }
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

function isImage(mimetype) {
    return mimetype && mimetype.startsWith('image/')
}

function fileUrl(req, filename) {
    const protocol = req.protocol
    const host = req.get('host')
    return `${protocol}://${host}/uploads/${encodeURIComponent(filename)}`
}

// List volunteers
router.get('/', async (req, res) => {
    try {
        const { status, category, featured } = req.query
        const where = {}

        if (status) where.status = status
        if (category) where.category = category
        if (featured !== undefined) where.featured = featured === 'true'

        const list = await Volunteer.findAll({
            where,
            order: [['order', 'ASC'], ['created_at', 'DESC']],
            limit: 100
        })
        res.json(list)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})

// Create volunteer
router.post('/', async (req, res) => {
    try {
        const payload = req.body || {}
        const volunteer = await Volunteer.create(payload)
        res.status(201).json(volunteer)
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err.message })
    }
})

// Get single volunteer
router.get('/:id', async (req, res) => {
    try {
        const v = await Volunteer.findByPk(req.params.id)
        if (!v) return res.status(404).json({ error: 'Not found' })
        res.json(v)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})

// Update volunteer
router.patch('/:id', async (req, res) => {
    try {
        const v = await Volunteer.findByPk(req.params.id)
        if (!v) return res.status(404).json({ error: 'Not found' })
        const patch = req.body || {}
        Object.keys(patch).forEach((k) => { v[k] = patch[k] })
        await v.save()
        res.json(v)
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err.message })
    }
})

// Delete volunteer
router.delete('/:id', async (req, res) => {
    try {
        const v = await Volunteer.findByPk(req.params.id)
        if (!v) return res.status(404).json({ error: 'Not found' })
        await v.destroy()
        res.json({ deleted: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})

// Upload files and attach to volunteer
router.post('/:id/files', upload.array('files'), async (req, res) => {
    try {
        const volunteer = await Volunteer.findByPk(req.params.id)
        if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' })

        if (!req.files || !req.files.length) return res.status(400).json({ error: 'No files uploaded' })

        const created = []
        for (const f of req.files) {
            const originalPath = f.path
            const ext = path.extname(f.filename).toLowerCase()
            let finalName = f.filename
            let optimized = false

            if (isImage(f.mimetype)) {
                const outName = `opt_${path.basename(f.filename, ext)}.jpg`
                const outPath = path.join(UPLOADS_DIR, outName)
                try {
                    await sharp(originalPath)
                        .resize({ width: 800, height: 800, fit: 'cover', withoutEnlargement: true })
                        .jpeg({ quality: 80, mozjpeg: true })
                        .toFile(outPath)
                    // remove original
                    try { fs.unlinkSync(originalPath) } catch (e) { }
                    finalName = outName
                    optimized = true
                } catch (e) {
                    console.error('Sharp optimization failed:', e)
                    // keep original
                }
            }

            const url = fileUrl(req, finalName)
            const fileRecord = await FileModel.create({
                filename: finalName,
                originalname: f.originalname,
                mime: f.mimetype,
                size: f.size,
                url,
                optimized
            })

            // associate with volunteer
            try {
                await volunteer.addFile(fileRecord)
            } catch (e) {
                console.error('associate failed', e.message || e)
            }

            created.push({ id: fileRecord.id, filename: finalName, url, optimized })
        }

        const refreshed = await Volunteer.findByPk(req.params.id)
        res.status(201).json({ files: created, volunteer: refreshed })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})

module.exports = router
