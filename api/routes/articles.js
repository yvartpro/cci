const express = require('express')
const router = express.Router()
const db = require('../models')
const blocksSvc = require('../services/articleBlocks')

const Article = db.Article

// List articles (basic)
router.get('/', async (req, res) => {
  try {
    const list = await Article.findAll({ order: [['created_at', 'DESC']], limit: 50 })
    res.json(list)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// Create article
router.post('/', async (req, res) => {
  try {
    const payload = req.body || {}
    const article = await Article.create(payload)
    res.status(201).json(article)
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.message })
  }
})

// Get single
router.get('/:id', async (req, res) => {
  try {
    const a = await Article.findByPk(req.params.id)
    if (!a) return res.status(404).json({ error: 'Not found' })
    res.json(a)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// Partial update using PATCH (not PUT) - merge provided fields
router.patch('/:id', async (req, res) => {
  try {
    const a = await Article.findByPk(req.params.id)
    if (!a) return res.status(404).json({ error: 'Not found' })
    const patch = req.body || {}
    Object.keys(patch).forEach((k) => { a[k] = patch[k] })
    // bump version for conflict-awareness
    a.version = (a.version || 1) + 1
    await a.save()
    res.json(a)
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.message })
  }
})

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const a = await Article.findByPk(req.params.id)
    if (!a) return res.status(404).json({ error: 'Not found' })
    await a.destroy()
    res.json({ deleted: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// Block operations (use PATCH for modifications)

// Insert block: POST /api/articles/:id/blocks
router.post('/:id/blocks', async (req, res) => {
  try {
    const block = req.body.block || req.body
    const position = req.body.position != null ? parseInt(req.body.position, 10) : null
    const inserted = await blocksSvc.insertBlock(req.params.id, block, position)
    const article = await Article.findByPk(req.params.id)
    res.status(201).json({ block: inserted, article })
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.message })
  }
})

// List blocks: GET /api/articles/:id/blocks
router.get('/:id/blocks', async (req, res) => {
  try {
    const a = await Article.findByPk(req.params.id)
    if (!a) return res.status(404).json({ error: 'Not found' })
    res.json(Array.isArray(a.blocks) ? a.blocks : [])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// Get single block: GET /api/articles/:id/blocks/:blockId
router.get('/:id/blocks/:blockId', async (req, res) => {
  try {
    const a = await Article.findByPk(req.params.id)
    if (!a) return res.status(404).json({ error: 'Not found' })
    const blocks = Array.isArray(a.blocks) ? a.blocks : []
    const b = blocks.find((x) => String(x.id) === String(req.params.blockId))
    if (!b) return res.status(404).json({ error: 'Block not found' })
    res.json(b)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// Update block: PATCH /api/articles/:id/blocks/:blockId
router.patch('/:id/blocks/:blockId', async (req, res) => {
  try {
    const patch = req.body
    const updated = await blocksSvc.updateBlock(req.params.id, req.params.blockId, patch)
    const article = await Article.findByPk(req.params.id)
    res.json({ block: updated, article })
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.message })
  }
})

// Move block: PATCH /api/articles/:id/blocks/:blockId/move
router.patch('/:id/blocks/:blockId/move', async (req, res) => {
  try {
    const newIndex = parseInt(req.body.newIndex, 10)
    if (Number.isNaN(newIndex)) return res.status(400).json({ error: 'newIndex required' })
    const moved = await blocksSvc.moveBlock(req.params.id, req.params.blockId, newIndex)
    const article = await Article.findByPk(req.params.id)
    res.json({ block: moved, article })
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.message })
  }
})

// Delete block
router.delete('/:id/blocks/:blockId', async (req, res) => {
  try {
    const removed = await blocksSvc.deleteBlock(req.params.id, req.params.blockId)
    const article = await Article.findByPk(req.params.id)
    res.json({ block: removed, article })
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.message })
  }
})

// Replace blocks: PATCH /api/articles/:id/blocks  (body: blocks: [])
router.patch('/:id/blocks', async (req, res) => {
  try {
    const newBlocks = req.body.blocks || req.body
    const replaced = await blocksSvc.replaceBlocks(req.params.id, newBlocks)
    const article = await Article.findByPk(req.params.id)
    res.json({ blocks: replaced, article })
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.message })
  }
})

module.exports = router
