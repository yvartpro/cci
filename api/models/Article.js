const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Article = sequelize.define('Article', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    excerpt: { type: DataTypes.TEXT },
    body: { type: DataTypes.TEXT },
    published: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'articles',
    underscored: true,
  })

  return Article
}
