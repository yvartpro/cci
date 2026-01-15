const path = require('path')
const db = require('./models')
require('dotenv').config({ path: path.join(__dirname, '.env') })

  ; (async () => {
    try {
      console.log('Connecting to DB...')
      await db.sequelize.authenticate()
      console.log('Connected. Creating/updating tables...')

      // Create tables one by one to avoid VIRTUAL field issues
      // Using force: false to not drop existing tables
      const models = [
        'File',
        'Article',
        'Volunteer',
        'User',
        'Carousel',
        'Partner',
        'Titre',
        'Comitard'
      ]

      for (const modelName of models) {
        if (db[modelName]) {
          try {
            await db[modelName].sync({ alter: false })
            console.log(`✅ Synced ${modelName}`)
          } catch (error) {
            // If table already exists, that's fine
            if (error.original && error.original.code === 'ER_TABLE_EXISTS_ERROR') {
              console.log(`ℹ️  Table for ${modelName} already exists`)
            } else {
              console.error(`❌ Error syncing ${modelName}:`, error.message)
            }
          }
        }
      }

      console.log('\n✅ Sync complete!')
      console.log('ℹ️  Note: Existing tables were not altered. Run sync-paranoid.js to add deleted_at columns.')
      process.exit(0)
    } catch (err) {
      console.error('❌ Sync failed:', err.message)
      process.exit(1)
    }
  })()
