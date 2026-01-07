const path = require('path')
const { Sequelize } = require('sequelize')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const DB_HOST = process.env.DB_HOST || '127.0.0.1'
const DB_PORT = process.env.DB_PORT || 3306
const DB_NAME = process.env.DB_NAME || 'cci_db'
const DB_USER = process.env.DB_USER || 'root'
const DB_PASS = process.env.DB_PASS || ''

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: false,
})

const db = { sequelize, Sequelize }

db.File = require('./File')(sequelize)
db.Article = require('./Article')(sequelize)
db.Volunteer = require('./Volunteer')(sequelize)

// associations
db.Article.belongsToMany(db.File, { through: 'article_files', as: 'files' })
db.File.belongsToMany(db.Article, { through: 'article_files', as: 'articles' })

db.Volunteer.belongsToMany(db.File, { through: 'volunteer_files', as: 'files' })
db.File.belongsToMany(db.Volunteer, { through: 'volunteer_files', as: 'volunteers' })

module.exports = db
