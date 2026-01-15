const express = require('express')
const router = express.Router()
const db = require('../models')
const fileResolver = require('../services/fileResolver')
const { authRequired, requireRole } = require('../middlewares/auth')

const Volunteer = db.Volunteer
const File = db.File

// List volunteers
router.get('/', async (req, res) => {
    try {
        const { status, category, featured } = req.query
        const where = {}

        if (status) where.status = status
        if (category) where.category = category
        if (featured !== undefined) where.featured = featured === 'true'

        const list = await Volunteer.findAll({
            include: [
                { model: File, as: 'image', attributes: ['id', 'url'] }
            ],
            where,
            order: [['order', 'ASC'], ['created_at', 'DESC']],
            limit: 100
        })

        // Resolve image_file_id for each volunteer
        const enrichedList = await Promise.all(list.map(async (volunteer) => {
            const volunteerData = volunteer.toJSON()

            // Resolve image (already included, but ensure it's populated)
            if (volunteerData.image_file_id && !volunteerData.image) {
                volunteerData.image = await fileResolver.resolveFileId(volunteerData.image_file_id)
            }

            return volunteerData
        }))

        res.json(enrichedList)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})

// Create volunteer
router.post('/', authRequired, async (req, res) => {
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
        const v = await Volunteer.findByPk(req.params.id, {
            include: [
                { model: File, as: 'image', attributes: ['id', 'url'] },
                { model: File, as: 'files', attributes: ['id', 'url'] }
            ],
        })
        if (!v) return res.status(404).json({ error: 'Not found' })

        const volunteerData = v.toJSON()

        // Resolve image_file_id if not already included
        if (volunteerData.image_file_id && !volunteerData.image) {
            volunteerData.image = await fileResolver.resolveFileId(volunteerData.image_file_id)
        }

        res.json(volunteerData)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})

// Update volunteer
router.patch('/:id', authRequired, async (req, res) => {
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
router.delete('/:id', authRequired, async (req, res) => {
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

// =====================
// FILE ASSOCIATIONS (Pivot Table Management)
// =====================

// Add files to volunteer: POST /api/volunteers/:id/files
// Body: { fileIds: [1, 2, 3] } or { fileId: 1 }
router.post('/:id/files', authRequired, async (req, res) => {
    try {
        const volunteer = await Volunteer.findByPk(req.params.id)
        if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' })

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

        // Add files to volunteer (creates records in volunteer_files pivot table)
        await volunteer.addFiles(files)

        // Reload with associations
        await volunteer.reload({ include: [{ model: File, as: 'files' }] })
        res.json(volunteer)
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err.message })
    }
})

// Remove files from volunteer: DELETE /api/volunteers/:id/files
// Body: { fileIds: [1, 2, 3] } or { fileId: 1 }
router.delete('/:id/files', authRequired, async (req, res) => {
    try {
        const volunteer = await Volunteer.findByPk(req.params.id)
        if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' })

        const { fileIds, fileId } = req.body
        const ids = fileIds || (fileId ? [fileId] : [])

        if (!ids.length) {
            return res.status(400).json({ error: 'fileIds or fileId required' })
        }

        // Remove files from volunteer (deletes records from volunteer_files pivot table)
        await volunteer.removeFiles(ids)

        // Reload with associations
        await volunteer.reload({ include: [{ model: File, as: 'files' }] })
        res.json(volunteer)
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err.message })
    }
})

// Set files for volunteer (replaces all): PUT /api/volunteers/:id/files
// Body: { fileIds: [1, 2, 3] }
router.put('/:id/files', authRequired, async (req, res) => {
    try {
        const volunteer = await Volunteer.findByPk(req.params.id)
        if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' })

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
        await volunteer.setFiles(ids)

        // Reload with associations
        await volunteer.reload({ include: [{ model: File, as: 'files' }] })
        res.json(volunteer)
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err.message })
    }
})

module.exports = router
