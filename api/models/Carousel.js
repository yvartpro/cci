const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Carousel = sequelize.define('Carousel', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    subtitle: { type: DataTypes.STRING },
    excerpt: { type: DataTypes.TEXT },
    image_url: { type: DataTypes.STRING },
    image_file_id: { type: DataTypes.INTEGER.UNSIGNED }
  }, {
    tableName: 'carousels',
    underscored: true,
    timestamps: true,
    paranoid: true,
  })

  return Carousel
}