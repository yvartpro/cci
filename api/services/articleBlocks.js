const { randomUUID } = require('crypto')
const db = require('../models')
const { Article, sequelize } = db

async function _loadArticle(articleId, options = {}) {
  const article = await Article.findByPk(articleId)
  if (!article) throw new Error('Article not found')
  if (!Array.isArray(article.blocks)) article.blocks = []
  return article
}

/** Insert a block at `position` (0-based). If position is omitted, append.
 * Returns the inserted block (with an `id` assigned).
 */
async function insertBlock(articleId, block, position = null) {
  return await sequelize.transaction(async (t) => {
    const article = await _loadArticle(articleId)
    const blocks = article.blocks.slice()
    if (!block.id) block.id = randomUUID()
    if (position === null || position >= blocks.length) blocks.push(block)
    else blocks.splice(Math.max(0, position), 0, block)
    article.blocks = blocks
    await article.save({ transaction: t })
    return block
  })
}

/** Update a block by `blockId`. `patch` may be a full block object (replace) or
 * a partial object to shallow-merge into the existing block.
 */
async function updateBlock(articleId, blockId, patch) {
  return await sequelize.transaction(async (t) => {
    const article = await _loadArticle(articleId)
    const blocks = article.blocks.slice()
    const idx = blocks.findIndex((b) => b.id === blockId)
    if (idx === -1) throw new Error('Block not found')
    const existing = blocks[idx]
    const updated = (patch && typeof patch === 'object' && !Array.isArray(patch))
      ? Object.assign({}, existing, patch)
      : patch
    updated.id = existing.id // preserve id
    blocks[idx] = updated
    article.blocks = blocks
    await article.save({ transaction: t })
    return blocks[idx]
  })
}

/** Delete a block by id. Returns the removed block. */
async function deleteBlock(articleId, blockId) {
  return await sequelize.transaction(async (t) => {
    const article = await _loadArticle(articleId)
    const blocks = article.blocks.slice()
    const idx = blocks.findIndex((b) => b.id === blockId)
    if (idx === -1) throw new Error('Block not found')
    const [removed] = blocks.splice(idx, 1)
    article.blocks = blocks
    await article.save({ transaction: t })
    return removed
  })
}

/** Move a block to a new index. */
async function moveBlock(articleId, blockId, newIndex) {
  return await sequelize.transaction(async (t) => {
    const article = await _loadArticle(articleId)
    const blocks = article.blocks.slice()
    const idx = blocks.findIndex((b) => b.id === blockId)
    if (idx === -1) throw new Error('Block not found')
    const [block] = blocks.splice(idx, 1)
    const insertAt = Math.max(0, Math.min(newIndex, blocks.length))
    blocks.splice(insertAt, 0, block)
    article.blocks = blocks
    await article.save({ transaction: t })
    return block
  })
}

/** Replace the entire blocks array (useful for reordering or bulk edits). */
async function replaceBlocks(articleId, newBlocks) {
  return await sequelize.transaction(async (t) => {
    const article = await _loadArticle(articleId)
    const sanitized = (Array.isArray(newBlocks) ? newBlocks : []).map((b) => ({ ...b, id: b.id || randomUUID() }))
    article.blocks = sanitized
    await article.save({ transaction: t })
    return article.blocks
  })
}

/** Read-only helper */
async function getBlocks(articleId) {
  const article = await _loadArticle(articleId)
  return article.blocks
}

module.exports = {
  insertBlock,
  updateBlock,
  deleteBlock,
  moveBlock,
  replaceBlocks,
  getBlocks,
}
