# File Management System - Updated Documentation

## Overview

The file management system has been refactored to:

1. **Use ID-based references** instead of storing URLs directly
2. **Implement soft deletes** for all models (paranoid mode)
3. **Automatically resolve file IDs to URLs** when returning data from the API

---

## Soft Deletes

All models now support **soft deletes** (paranoid mode). When you delete a record, it's not permanently removed from the database. Instead, a `deleted_at` timestamp is set.

### How It Works

```javascript
// Soft delete (default behavior)
await article.destroy()
// Sets deleted_at = current timestamp
// Record is hidden from queries

// Permanent delete (force)
await article.destroy({ force: true })
// Actually removes the record from database
```

### Querying Soft-Deleted Records

```javascript
// Normal query - excludes soft-deleted records
const articles = await Article.findAll()

// Include soft-deleted records
const allArticles = await Article.findAll({ paranoid: false })

// Only soft-deleted records
const deletedArticles = await Article.findAll({
  where: { deleted_at: { [Op.ne]: null } },
  paranoid: false
})
```

### Restoring Soft-Deleted Records

```javascript
// Restore a soft-deleted record
await article.restore()
// Sets deleted_at = null
```

### Models with Soft Delete

- ✅ `File`
- ✅ `Article`
- ✅ `Volunteer`
- ✅ `Carousel`
- ✅ `Comitard`
- ✅ `Partner`
- ✅ `User`
- ✅ `Titre`

---

## File ID Resolution

### The Problem (Before)

Previously, you might have stored file URLs directly in article sections:

```json
{
  "sections": [
    {
      "type": "image",
      "url": "http://localhost:3000/cci/uploads/image123.jpg"
    }
  ]
}
```

**Issues:**
- URLs break if domain changes
- Hard to track which file is which
- No relationship to the `files` table

### The Solution (Now)

Store **file IDs** instead, and the API automatically resolves them to full file objects:

```json
{
  "sections": [
    {
      "type": "image",
      "fileId": 123
    }
  ]
}
```

When you GET the article, the API returns:

```json
{
  "sections": [
    {
      "type": "image",
      "fileId": 123,
      "file": {
        "id": 123,
        "filename": "image123.jpg",
        "url": "http://localhost:3000/cci/uploads/image123.jpg",
        "mime": "image/jpeg",
        "size": 45678
      }
    }
  ]
}
```

---

## Article Structure

### Hero Image

Articles have a `hero_file_id` field for the main/featured image:

```javascript
// Create article with hero image
const article = await Article.create({
  title: 'My Article',
  slug: 'my-article',
  hero_file_id: 5,  // ID of the file
  sections: []
})

// When you GET the article, hero_file is automatically populated
// Response includes:
{
  "id": 1,
  "title": "My Article",
  "hero_file_id": 5,
  "hero_file": {
    "id": 5,
    "filename": "hero.jpg",
    "url": "http://localhost:3000/cci/uploads/hero.jpg"
  }
}
```

### Sections with Images

Sections should store file IDs, not URLs:

#### Single Image Section

```json
{
  "id": "section-1",
  "type": "image",
  "fileId": 10,
  "caption": "Beautiful landscape"
}
```

#### Gallery Section (Multiple Images)

```json
{
  "id": "section-2",
  "type": "gallery",
  "fileIds": [11, 12, 13, 14],
  "caption": "Photo gallery"
}
```

#### Text Section (No Images)

```json
{
  "id": "section-3",
  "type": "text",
  "content": "Lorem ipsum dolor sit amet..."
}
```

### API Response

When you GET an article, all file IDs are automatically resolved:

```json
{
  "id": 1,
  "title": "My Article",
  "hero_file_id": 5,
  "hero_file": {
    "id": 5,
    "url": "http://localhost:3000/cci/uploads/hero.jpg"
  },
  "sections": [
    {
      "id": "section-1",
      "type": "image",
      "fileId": 10,
      "file": {
        "id": 10,
        "url": "http://localhost:3000/cci/uploads/image10.jpg"
      },
      "caption": "Beautiful landscape"
    },
    {
      "id": "section-2",
      "type": "gallery",
      "fileIds": [11, 12, 13],
      "files": [
        { "id": 11, "url": "http://localhost:3000/cci/uploads/image11.jpg" },
        { "id": 12, "url": "http://localhost:3000/cci/uploads/image12.jpg" },
        { "id": 13, "url": "http://localhost:3000/cci/uploads/image13.jpg" }
      ],
      "caption": "Photo gallery"
    }
  ]
}
```

---

## Volunteers & Comitards

Similar to articles, volunteers and comitards have an `image_file_id` field:

```javascript
// Create volunteer with image
const volunteer = await Volunteer.create({
  name: 'John Doe',
  role: 'Community Leader',
  image_file_id: 20
})

// GET response includes resolved image
{
  "id": 1,
  "name": "John Doe",
  "image_file_id": 20,
  "image": {
    "id": 20,
    "url": "http://localhost:3000/cci/uploads/volunteer20.jpg"
  }
}
```

---

## Pivot Table Files

Articles, volunteers, and carousels can have **multiple files** through pivot tables.

### Adding Files via Pivot Table

```bash
# Add files to article
POST /api/articles/1/files
{
  "fileIds": [1, 2, 3]
}

# Response includes all associated files
{
  "id": 1,
  "title": "My Article",
  "files": [
    { "id": 1, "url": "..." },
    { "id": 2, "url": "..." },
    { "id": 3, "url": "..." }
  ]
}
```

### Soft-Deleted Files in Pivot Tables

If a file is soft-deleted, it will **automatically be excluded** from pivot table queries:

```javascript
// File 2 is soft-deleted
await File.findByPk(2).then(f => f.destroy())

// GET article - file 2 is automatically excluded
{
  "id": 1,
  "files": [
    { "id": 1, "url": "..." },
    { "id": 3, "url": "..." }
  ]
}
```

---

## Database Setup

### Running the Sync Script

After updating your code, run the sync script **once** to add `deleted_at` columns:

```bash
cd /home/yves/project/cci/cci/api
node sync-paranoid.js
```

This will add `deleted_at` columns to all tables.

### Manual Migration (Alternative)

If you prefer manual migrations:

```sql
ALTER TABLE files ADD COLUMN deleted_at DATETIME DEFAULT NULL;
ALTER TABLE articles ADD COLUMN deleted_at DATETIME DEFAULT NULL;
ALTER TABLE volunteers ADD COLUMN deleted_at DATETIME DEFAULT NULL;
ALTER TABLE carousels ADD COLUMN deleted_at DATETIME DEFAULT NULL;
ALTER TABLE comitards ADD COLUMN deleted_at DATETIME DEFAULT NULL;
ALTER TABLE Partner ADD COLUMN deleted_at DATETIME DEFAULT NULL;
ALTER TABLE User ADD COLUMN deleted_at DATETIME DEFAULT NULL;
ALTER TABLE Titre ADD COLUMN deleted_at DATETIME DEFAULT NULL;
```

---

## Migration Guide for Existing Data

If you have existing articles with URLs in sections, you'll need to migrate them to use file IDs.

### Example Migration Script

```javascript
const db = require('./models')
const { Article, File } = db

async function migrateArticleSections() {
  const articles = await Article.findAll()
  
  for (const article of articles) {
    if (!article.sections) continue
    
    const updatedSections = await Promise.all(article.sections.map(async (section) => {
      // If section has a URL, find the corresponding file
      if (section.url) {
        const filename = section.url.split('/').pop()
        const file = await File.findOne({ where: { filename } })
        
        if (file) {
          // Replace URL with fileId
          delete section.url
          section.fileId = file.id
        }
      }
      
      return section
    }))
    
    article.sections = updatedSections
    await article.save()
  }
  
  console.log('Migration complete!')
}

migrateArticleSections()
```

---

## Best Practices

### ✅ DO

- Store file IDs in sections: `{ "fileId": 123 }`
- Use soft delete for most deletions
- Let the API resolve file IDs to URLs automatically
- Use pivot tables for many-to-many file relationships

### ❌ DON'T

- Store URLs directly in sections
- Use `destroy({ force: true })` unless absolutely necessary
- Manually construct file URLs in your frontend
- Delete files that are referenced by other entities

---

## API Endpoints Summary

### Articles
- `GET /api/articles` - List articles (with hero_file resolved)
- `GET /api/articles/:id` - Get article (with hero_file and section files resolved)
- `POST /api/articles/:id/files` - Add files to article (pivot table)
- `DELETE /api/articles/:id/files` - Remove files from article
- `PUT /api/articles/:id/files` - Replace all files

### Volunteers
- `GET /api/volunteers` - List volunteers (with image resolved)
- `GET /api/volunteers/:id` - Get volunteer (with image and files resolved)
- `POST /api/volunteers/:id/files` - Add files to volunteer
- `DELETE /api/volunteers/:id/files` - Remove files from volunteer
- `PUT /api/volunteers/:id/files` - Replace all files

### Comitards
- `GET /api/comitard` - List comitards (with image resolved)
- `GET /api/comitard/:id` - Get comitard (with image resolved)

### Carousels
- `GET /api/carousel` - List carousels (with files resolved)
- `GET /api/carousel/:id` - Get carousel (with files resolved)
- `POST /api/carousel/:id/files` - Add files to carousel
- `DELETE /api/carousel/:id/files` - Remove files from carousel
- `PUT /api/carousel/:id/files` - Replace all files
