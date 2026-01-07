const { DataTypes } = require('sequelize')

/**
 * Volunteer model for managing volunteer profiles
 * Supports rich bio content, images, testimonials, and categorization
 */
module.exports = (sequelize) => {
    const Volunteer = sequelize.define('Volunteer', {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        role: { type: DataTypes.STRING },
        category: {
            type: DataTypes.ENUM('Education', 'Environment', 'Formation', 'Leadership'),
            allowNull: true
        },

        // Rich text biography
        bio: { type: DataTypes.TEXT },

        // Optional testimonial
        testimonial: { type: DataTypes.TEXT },

        // Image references
        image_url: { type: DataTypes.STRING },
        image_file_id: { type: DataTypes.INTEGER.UNSIGNED },

        // Status and visibility
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'archived'),
            allowNull: false,
            defaultValue: 'active'
        },
        featured: { type: DataTypes.BOOLEAN, defaultValue: false },

        // Custom ordering
        order: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 }
    }, {
        tableName: 'volunteers',
        underscored: true,
        timestamps: true,
    })

    return Volunteer
}
