const express = require('express')
const router = express.Router()
const db = require('../models')
const { authRequired, requireRole } = require('../middlewares/auth')

const Titre = db.Titre

// List Titres
router.get('/', async (req, res) => {
    try {
        const list = await Titre.findAll({
            order: [['created_at', 'DESC']],
            limit: 100
        })
        res.json(list)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})

// Create Titre
router.post('/', authRequired, requireRole("admin"), async (req, res) => {
    try {
        const payload = req.body || {}
        const titre = await Titre.create(payload)
        res.status(201).json(titre)
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err.message })
    }
})

// Get single Titre
router.get('/:id', async (req, res) => {
    try {
        const titre = await Titre.findByPk(req.params.id)
        if (!Titre) return res.status(404).json({ error: 'Not found' })
        res.json(titre)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})

// Update Titre
router.patch('/:id', authRequired, async (req, res) => {
    try {
        const titre = await Titre.findByPk(req.params.id)
        if (!titre) return res.status(404).json({ error: 'Not found' })
        const patch = req.body || {}
        Object.keys(patch).forEach((key) => { titre[key] = patch[key] })
        await titre.save()
        res.json(titre)
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err.message })
    }
})

// Delete volunteer
router.delete('/:id', authRequired, requireRole("admin"), async (req, res) => {
    try {
        const titre = await Titre.findByPk(req.params.id)
        if (!titre) return res.status(404).json({ error: 'Not found' })
        await titre.destroy()
        res.json({ deleted: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})

module.exports = router