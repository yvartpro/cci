const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const File = sequelize.define('File', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    filename: { type: DataTypes.STRING, allowNull: false },
    originalname: { type: DataTypes.STRING },
    mime: { type: DataTypes.STRING },
    size: { type: DataTypes.INTEGER },
    url: { type: DataTypes.STRING },
    optimized: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'files',
    underscored: true,
  })

  return File
}
