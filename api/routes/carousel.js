const express = require('express')
const router = express.Router()
const db = require('../models')
const { authRequired, requireRole } = require('../middlewares/auth')

const Carousel = db.Carousel
const File = db.File

// List carousels
router.get('/', async (req, res) => {
    try {
        const list = await Carousel.findAll({
            include: [{ model: File, as: 'files', attributes: ['id', 'url'] }],
            order: [['created_at', 'DESC']],
            limit: 100
        })
        res.json(list)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})

// Create Carousel
router.post('/', authRequired, async (req, res) => {
    try {
        const payload = req.body || {}
        const carousel = await Carousel.create(payload)
        res.status(201).json(carousel)
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err.message })
    }
})

// Get single Carousel
router.get('/:id', async (req, res) => {
    try {
        const carousel = await Carousel.findByPk(req.params.id, {
            include: [{ model: File, as: 'files', attributes: ['id', 'url'] }]
        })
        if (!carousel) return res.status(404).json({ error: 'Not found' })
        res.json(carousel)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})

// Update carousel
router.patch('/:id', authRequired, async (req, res) => {
    try {
        const carousel = await Carousel.findByPk(req.params.id)
        if (!carousel) return res.status(404).json({ error: 'Not found' })
        const patch = req.body || {}
        Object.keys(patch).forEach((key) => { carousel[key] = patch[key] })
        await carousel.save()
        res.json(carousel)
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err.message })
    }
})

// Delete volunteer
router.delete('/:id', authRequired, requireRole("admin"), async (req, res) => {
    try {
        const carousel = await Carousel.findByPk(req.params.id)
        if (!carousel) return res.status(404).json({ error: 'Not found' })
        await carousel.destroy()
        res.json({ deleted: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})

// =====================
// FILE ASSOCIATIONS (Pivot Table Management)
// =====================

// Add files to carousel: POST /api/carousel/:id/files
// Body: { fileIds: [1, 2, 3] } or { fileId: 1 }
router.post('/:id/files', authRequired, async (req, res) => {
    try {
        const carousel = await Carousel.findByPk(req.params.id)
        if (!carousel) return res.status(404).json({ error: 'Carousel not found' })

        const { fileIds, fileId } = req.body
        const ids = fileIds || (fileId ? [fileId] : [])

        if (!ids.length) {
            return res.status(400).json({ error: 'fileIds or fileId required' })
        }

        // Verify all files exist
        const files = await File.findAll({ where: { id: ids } })
        if (files.length !== ids.length) {
            return res.status(400).json({ error: 'Some files not found' })
        }

        // Add files to carousel (creates records in carousel_files pivot table)
        await carousel.addFiles(files)

        // Reload with associations
        await carousel.reload({ include: [{ model: File, as: 'files' }] })
        res.json(carousel)
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err.message })
    }
})

// Remove files from carousel: DELETE /api/carousel/:id/files
// Body: { fileIds: [1, 2, 3] } or { fileId: 1 }
router.delete('/:id/files', authRequired, async (req, res) => {
    try {
        const carousel = await Carousel.findByPk(req.params.id)
        if (!carousel) return res.status(404).json({ error: 'Carousel not found' })

        const { fileIds, fileId } = req.body
        const ids = fileIds || (fileId ? [fileId] : [])

        if (!ids.length) {
            return res.status(400).json({ error: 'fileIds or fileId required' })
        }

        // Remove files from carousel (deletes records from carousel_files pivot table)
        await carousel.removeFiles(ids)

        // Reload with associations
        await carousel.reload({ include: [{ model: File, as: 'files' }] })
        res.json(carousel)
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err.message })
    }
})

// Set files for carousel (replaces all): PUT /api/carousel/:id/files
// Body: { fileIds: [1, 2, 3] }
router.put('/:id/files', authRequired, async (req, res) => {
    try {
        const carousel = await Carousel.findByPk(req.params.id)
        if (!carousel) return res.status(404).json({ error: 'Carousel not found' })

        const { fileIds } = req.body
        const ids = fileIds || []

        if (ids.length > 0) {
            // Verify all files exist
            const files = await File.findAll({ where: { id: ids } })
            if (files.length !== ids.length) {
                return res.status(400).json({ error: 'Some files not found' })
            }
        }

        // Replace all files (removes old associations and creates new ones)
        await carousel.setFiles(ids)

        // Reload with associations
        await carousel.reload({ include: [{ model: File, as: 'files' }] })
        res.json(carousel)
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err.message })
    }
})

module.exports = router