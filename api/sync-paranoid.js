const path = require('path')
const db = require('./models')
require('dotenv').config({ path: path.join(__dirname, '.env') })

/**
 * Sync script to add deleted_at columns to all tables
 * This enables soft deletes (paranoid mode) for all models
 * 
 * Run this ONCE after updating models with paranoid: true
 * 
 * Usage: node sync-paranoid.js
 */

async function syncDatabase() {
    try {
        console.log('🔄 Starting database sync for paranoid mode...')
        console.log('📊 This will add deleted_at columns to all tables')

        const tables = [
            'files',
            'articles',
            'volunteers',
            'carousel',  // Note: singular, not plural
            'comitards',
            'Partner',
            'User',
            'Titre'
        ]

        // Manually add deleted_at columns to avoid VIRTUAL field issues
        for (const table of tables) {
            try {
                await db.sequelize.query(
                    `ALTER TABLE \`${table}\` ADD COLUMN \`deleted_at\` DATETIME DEFAULT NULL`,
                    { raw: true }
                )
                console.log(`✅ Added deleted_at to ${table}`)
            } catch (error) {
                // Column might already exist
                if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
                    console.log(`ℹ️  Column deleted_at already exists in ${table}`)
                } else if (error.original && error.original.code === 'ER_NO_SUCH_TABLE') {
                    console.log(`⚠️  Table ${table} doesn't exist, skipping...`)
                } else {
                    throw error
                }
            }
        }

        console.log('')
        console.log('✅ Database sync completed successfully!')
        console.log('ℹ️  Soft deletes are now enabled!')
        console.log('   - Use instance.destroy() for soft delete')
        console.log('   - Use instance.destroy({ force: true }) for permanent delete')
        console.log('   - Soft-deleted records are automatically excluded from queries')

        process.exit(0)
    } catch (error) {
        console.error('❌ Error syncing database:', error)
        process.exit(1)
    }
}

syncDatabase()
