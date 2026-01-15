const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Titre = sequelize.define('Titre', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    ordre: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true }
  }, {
    tableName: 'Titre',
    underscored: true,
    timestamps: true,
    paranoid: true,
  })

  return Titre
}