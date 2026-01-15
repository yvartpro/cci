const express = require('express')
const router = express.Router()
const db = require('../models')
const { authRequired, requireRole } = require('../middlewares/auth')

const Partner = db.Partner

// List Partners
router.get('/', async (req, res) => {
    try {
        const list = await Partner.findAll({
            order: [['created_at', 'DESC']],
            limit: 100
        })
        res.json(list)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})

// Create Partner
router.post('/', authRequired, requireRole("admin"), async (req, res) => {
    try {
        const payload = req.body || {}
        const partner = await Partner.create(payload)
        res.status(201).json(partner)
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err.message })
    }
})

// Get single Partner
router.get('/:id', async (req, res) => {
    try {
        const partner = await Partner.findByPk(req.params.id)
        if (!partner) return res.status(404).json({ error: 'Not found' })
        res.json(partner)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})

// Update Partner
router.patch('/:id', authRequired, async (req, res) => {
    try {
        const partner = await Partner.findByPk(req.params.id)
        if (!partner) return res.status(404).json({ error: 'Not found' })
        const patch = req.body || {}
        Object.keys(patch).forEach((key) => { partner[key] = patch[key] })
        await partner.save()
        res.json(partner)
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err.message })
    }
})

// Delete volunteer
router.delete('/:id', authRequired, requireRole("admin"), async (req, res) => {
    try {
        const partner = await Partner.findByPk(req.params.id)
        if (!partner) return res.status(404).json({ error: 'Not found' })
        await partner.destroy()
        res.json({ deleted: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})

module.exports = router