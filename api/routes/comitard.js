const express = require('express')
const router = express.Router()
const db = require('../models')
const fileResolver = require('../services/fileResolver')
const { authRequired, requireRole } = require('../middlewares/auth')

const Comitard = db.Comitard
const Titre = db.Titre
const File = db.File

// List Comitards

router.get('/', async (req, res) => {
    try {
        const list = await Comitard.findAll({
            include: [
                { model: Titre, as: 'titre', attributes: ['name', 'ordre', 'description'], },
                { model: File, as: 'image', attributes: ['id', 'url'] }
            ],
            order: [['created_at', 'DESC']],
        })

        // Resolve image_file_id for each comitard
        const enrichedList = await Promise.all(list.map(async (comitard) => {
            const comitardData = comitard.toJSON()

            // Resolve image if not already included
            if (comitardData.image_file_id && !comitardData.image) {
                comitardData.image = await fileResolver.resolveFileId(comitardData.image_file_id)
            }

            return comitardData
        }))

        res.json(enrichedList)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})


// Create Comitard
router.post('/', authRequired, requireRole("admin"), async (req, res) => {
    try {
        const payload = req.body || {}
        const comitard = await Comitard.create(payload)
        res.status(201).json(comitard)
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err.message })
    }
})

// Get single Comitard
router.get('/:id', async (req, res) => {
    try {
        const comitard = await Comitard.findByPk(req.params.id, {
            include: [
                { model: Titre, as: 'titre', attributes: ['name', 'ordre', 'description'], },
                { model: File, as: 'image', attributes: ['id', 'url'] }
            ],
        })
        if (!comitard) return res.status(404).json({ error: 'Not found' })

        const comitardData = comitard.toJSON()

        // Resolve image_file_id if not already included
        if (comitardData.image_file_id && !comitardData.image) {
            comitardData.image = await fileResolver.resolveFileId(comitardData.image_file_id)
        }

        res.json(comitardData)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})

// Update Comitard
router.patch('/:id', authRequired, async (req, res) => {
    try {
        const comitard = await Comitard.findByPk(req.params.id)
        if (!comitard) return res.status(404).json({ error: 'Not found' })
        const patch = req.body || {}
        Object.keys(patch).forEach((key) => { comitard[key] = patch[key] })
        await comitard.save()
        res.json(comitard)
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err.message })
    }
})

// Delete volunteer
router.delete('/:id', authRequired, requireRole("admin"), async (req, res) => {
    try {
        const comitard = await Comitard.findByPk(req.params.id)
        if (!comitard) return res.status(404).json({ error: 'Not found' })
        await comitard.destroy()
        res.json({ deleted: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})

module.exports = router