const db = require('./models')

async function run() {
  try {
    console.log('Connecting to DB...')
    await db.sequelize.authenticate()
    console.log('Connected. Syncing models (alter=true)')
    await db.sequelize.sync({ alter: true })
    console.log('Sync complete.')
    process.exit(0)
  } catch (err) {
    console.error('Sync failed:', err.message || err)
    process.exit(1)
  }
}

run()
