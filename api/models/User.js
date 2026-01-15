const { DataTypes } = require('sequelize')
const bcrypt = require('bcryptjs')


module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    fullName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    role: { type: DataTypes.ENUM('editor', 'admin'), defaultValue: "editor" },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: "active" },
    passwordHash: { type: DataTypes.STRING, allowNull: false },

  }, {
    tableName: 'User',
    timestamps: true,
    paranoid: true,
    hooks: {
      async beforeSave(user) {
        if (user.changed('passwordHash')) {
          user.passwordHash = await bcrypt.hash(user.passwordHash, 10)
        }
      }
    }

  })

  User.prototype.validatePassword = async function (password) {
    return bcrypt.compare(password, this.passwordHash)
  }

  return User
}
