const db = require('../models')
const { File } = db

/**
 * File Resolution Service
 * 
 * Resolves file IDs to full file objects with URLs
 * Used when returning articles, volunteers, etc. to populate image URLs from IDs
 */

/**
 * Resolve a single file ID to a file object
 * @param {number} fileId - The file ID to resolve
 * @returns {Promise<Object|null>} File object with URL or null if not found
 */
async function resolveFileId(fileId) {
    if (!fileId) return null

    try {
        const file = await File.findByPk(fileId, {
            attributes: ['id', 'filename', 'originalname', 'mime', 'size', 'url', 'use_as', 'optimized']
        })

        return file ? file.toJSON() : null
    } catch (error) {
        console.error(`Error resolving file ID ${fileId}:`, error)
        return null
    }
}

/**
 * Resolve multiple file IDs to file objects
 * @param {number[]} fileIds - Array of file IDs to resolve
 * @returns {Promise<Object[]>} Array of file objects with URLs
 */
async function resolveFileIds(fileIds) {
    if (!Array.isArray(fileIds) || fileIds.length === 0) return []

    try {
        const files = await File.findAll({
            where: { id: fileIds },
            attributes: ['id', 'filename', 'originalname', 'mime', 'size', 'url', 'use_as', 'optimized']
        })

        // Maintain the order of input IDs
        const fileMap = new Map(files.map(f => [f.id, f.toJSON()]))
        return fileIds.map(id => fileMap.get(id)).filter(Boolean)
    } catch (error) {
        console.error('Error resolving file IDs:', error)
        return []
    }
}

/**
 * Resolve file references in article sections
 * Handles both single fileId and multiple fileIds in sections
 * @param {Array} sections - Array of section objects
 * @returns {Promise<Array>} Sections with resolved file objects
 */
async function resolveSectionFiles(sections) {
    if (!Array.isArray(sections)) return []

    const resolvedSections = []

    for (const section of sections) {
        const resolvedSection = { ...section }

        // Handle single file reference
        if (section.fileId) {
            const file = await resolveFileId(section.fileId)
            if (file) {
                resolvedSection.file = file
            }
        }

        // Handle multiple file references (gallery, etc.)
        if (Array.isArray(section.fileIds) && section.fileIds.length > 0) {
            const files = await resolveFileIds(section.fileIds)
            if (files.length > 0) {
                resolvedSection.files = files
            }
        }

        resolvedSections.push(resolvedSection)
    }

    return resolvedSections
}

/**
 * Resolve file references in article blocks (similar to sections)
 * @param {Array} blocks - Array of block objects
 * @returns {Promise<Array>} Blocks with resolved file objects
 */
async function resolveBlockFiles(blocks) {
    // Blocks and sections have the same structure, so we can reuse the logic
    return resolveSectionFiles(blocks)
}

module.exports = {
    resolveFileId,
    resolveFileIds,
    resolveSectionFiles,
    resolveBlockFiles,
}
