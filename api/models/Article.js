const { DataTypes } = require('sequelize')

/**
 * Article model designed to be flexible and store deep structured content.
 * - `blocks` : JSON array of content blocks (sections, headings, paragraphs, lists, quotes, images, citations, embeds, galleries, etc.)
 * - `meta`   : JSON object for SEO, custom fields, open graph, etc.
 * - `tags`   : JSON array of tag strings
 *
 * Each block should be an object like:
 * { type: 'heading'|'paragraph'|'list'|'image'|'quote'|'citation'|'section'|'embed'|..., data: { ... } }
 */
module.exports = (sequelize) => {
  const Article = sequelize.define('Article', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.ENUM('LaSTAR', 'CCI Invest', 'CCI Social') },
    subtitle: { type: DataTypes.STRING },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    excerpt: { type: DataTypes.TEXT },


    sections: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },

    hero_url: { type: DataTypes.STRING },
    hero_file_id: { type: DataTypes.INTEGER.UNSIGNED },

    // metadata, tags and SEO
    tags: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    meta: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },

    // status and publication
    status: { type: DataTypes.ENUM('draft', 'published', 'archived'), allowNull: false, defaultValue: 'draft' },
    published_at: { type: DataTypes.DATE },

    // author and misc
    author_name: { type: DataTypes.STRING },
    language: { type: DataTypes.ENUM('fr', 'en', 'sw', 'rn'), defaultValue: 'fr' },
    reading_time: { type: DataTypes.INTEGER.UNSIGNED },
    views_count: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },

    // versioning / flags
    version: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 1 },
    featured: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'articles',
    underscored: true,
    timestamps: true,
  })

  return Article
}
