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

/* =====================
   MODELS
===================== */

db.File = require('./File')(sequelize)
db.Article = require('./Article')(sequelize)
db.Volunteer = require('./Volunteer')(sequelize)
db.User = require('./User')(sequelize)
db.Carousel = require('./Carousel')(sequelize)
db.Partner = require('./Partner')(sequelize)
db.Titre = require('./Titre')(sequelize)
db.Comitard = require('./Comitard')(sequelize)

/* =====================
   ASSOCIATIONS
===================== */

/* Article ↔ File (M:N) */
db.Article.belongsToMany(db.File, { through: 'article_files', as: 'files' })
db.File.belongsToMany(db.Article, { through: 'article_files', as: 'articles' })

/* Volunteer ↔ File (M:N) */
db.Volunteer.belongsToMany(db.File, { through: 'volunteer_files', as: 'files' })
db.File.belongsToMany(db.Volunteer, { through: 'volunteer_files', as: 'volunteers' })

/* Carousel ↔ File (M:N) */
db.Carousel.belongsToMany(db.File, { through: 'carousel_files', as: 'files' })
db.File.belongsToMany(db.Carousel, { through: 'carousel_files', as: 'carousels' })

/* =====================
   ONE TO ONE RELATIONS
===================== */

/* Partner ↔ File (image) */
db.File.hasOne(db.Partner, { foreignKey: 'file_id', as: 'partner', onDelete: 'SET NULL' })
db.Partner.belongsTo(db.File, { foreignKey: 'file_id', as: 'image', onDelete: 'SET NULL' })

/* Comitard ↔ File */
db.File.hasOne(db.Comitard, { foreignKey: 'image_file_id', as: 'comitard', onDelete: 'SET NULL' });
db.Comitard.belongsTo(db.File, { foreignKey: 'image_file_id', as: 'image', onDelete: 'SET NULL' });

/* Comitard ↔ Titre */
db.Titre.hasOne(db.Comitard, { foreignKey: 'titre_id', as: 'comitard', onDelete: 'SET NULL' });
db.Comitard.belongsTo(db.Titre, { foreignKey: 'titre_id', as: 'titre', onDelete: 'SET NULL' });

/* Volunteer ↔ File (si vous voulez la même logique ici) */
db.File.hasOne(db.Volunteer, { foreignKey: 'image_file_id', as: 'volunteer', onDelete: 'SET NULL' });
db.Volunteer.belongsTo(db.File, { foreignKey: 'image_file_id', as: 'image', onDelete: 'SET NULL' });

module.exports = db