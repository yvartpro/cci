const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Partner = sequelize.define('Partner', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING, allowNull: false },
    sigle: { type: DataTypes.STRING, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    image_url: { type: DataTypes.STRING },
    image_file_id: { type: DataTypes.INTEGER.UNSIGNED }
  }, {
    tableName: 'Partner',
    underscored: true,
    timestamps: true,
    paranoid: true,
  })

  return Partner
}