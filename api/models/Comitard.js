const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Comitard = sequelize.define('Comitard', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    cv: { type: DataTypes.TEXT, allowNull: true },
    links: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },

    image_file_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    titre_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  }, {
    tableName: 'comitards',
    underscored: true,
    timestamps: true,
    paranoid: true,
  })

  return Comitard
}
