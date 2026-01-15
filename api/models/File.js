const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const File = sequelize.define('File', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    filename: { type: DataTypes.STRING, allowNull: false },
    originalname: { type: DataTypes.STRING },
    mime: { type: DataTypes.STRING },
    size: { type: DataTypes.INTEGER },
    url: {
      type: DataTypes.VIRTUAL,
      get() {
        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
        const filename = this.getDataValue('filename');
        // Note: index.js serves uploads at /cci/uploads
        return filename ? `${baseUrl}/cci/uploads/${filename}` : null;
      }
    },
    use_as: { type: DataTypes.ENUM('hero', 'presentation', 'volunteer', 'social', 'lastar', 'invest', 'contact', 'news', 'activities') },
    optimized: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'files',
    underscored: true,
    timestamps: true,
    paranoid: true,
  })

  return File
}
