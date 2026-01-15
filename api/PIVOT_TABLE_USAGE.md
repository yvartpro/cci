# Pivot Table Management - File Associations

## Overview

This API uses **many-to-many (M:N) relationships** between entities and files through pivot tables. The pivot tables are:

- `article_files` - Associates articles with files
- `volunteer_files` - Associates volunteers with files  
- `carousel_files` - Associates carousels with files

## How It Works

When you define a `belongsToMany` relationship in Sequelize, it automatically creates helper methods:

- `addFiles(fileIds)` - Add files to the entity (creates pivot table records)
- `removeFiles(fileIds)` - Remove files from the entity (deletes pivot table records)
- `setFiles(fileIds)` - Replace all files (removes old associations, creates new ones)
- `getFiles()` - Get all associated files

## API Endpoints

### Articles

#### Add Files to Article
```http
POST /api/articles/:id/files
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileIds": [1, 2, 3]
}
// OR for a single file
{
  "fileId": 1
}
```

**Response:**
```json
{
  "id": 1,
  "title": "My Article",
  "files": [
    { "id": 1, "url": "https://..." },
    { "id": 2, "url": "https://..." }
  ]
}
```

#### Remove Files from Article
```http
DELETE /api/articles/:id/files
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileIds": [1, 2]
}
```

#### Replace All Files (Set Files)
```http
PUT /api/articles/:id/files
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileIds": [3, 4, 5]
}
```

This will remove ALL existing file associations and create new ones with files 3, 4, and 5.

---

### Volunteers

#### Add Files to Volunteer
```http
POST /api/volunteers/:id/files
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileIds": [1, 2, 3]
}
```

#### Remove Files from Volunteer
```http
DELETE /api/volunteers/:id/files
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileIds": [1, 2]
}
```

#### Replace All Files
```http
PUT /api/volunteers/:id/files
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileIds": [3, 4, 5]
}
```

---

### Carousels

#### Add Files to Carousel
```http
POST /api/carousel/:id/files
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileIds": [1, 2, 3]
}
```

#### Remove Files from Carousel
```http
DELETE /api/carousel/:id/files
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileIds": [1, 2]
}
```

#### Replace All Files
```http
PUT /api/carousel/:id/files
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileIds": [3, 4, 5]
}
```

---

## Usage Examples

### Example 1: Create Article and Add Files

```javascript
// Step 1: Create the article
const articleResponse = await fetch('/api/articles', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'My New Article',
    slug: 'my-new-article',
    sections: []
  })
});

const article = await articleResponse.json();

// Step 2: Upload files (assuming you have a file upload endpoint)
const fileResponse = await fetch('/api/files', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' },
  body: formData // your file upload
});

const file = await fileResponse.json();

// Step 3: Associate the file with the article
await fetch(`/api/articles/${article.id}/files`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fileId: file.id
  })
});
```

### Example 2: Update Volunteer Files

```javascript
// Replace all files for a volunteer
await fetch('/api/volunteers/5/files', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fileIds: [10, 11, 12]
  })
});
```

### Example 3: Add Multiple Files at Once

```javascript
// Add multiple files to a carousel
await fetch('/api/carousel/3/files', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fileIds: [1, 2, 3, 4, 5]
  })
});
```

## Error Handling

All endpoints validate:
1. Entity exists (Article/Volunteer/Carousel)
2. All file IDs exist in the database
3. Request body contains valid data

**Common Errors:**

```json
// Entity not found
{
  "error": "Article not found"
}

// Invalid file IDs
{
  "error": "Some files not found"
}

// Missing data
{
  "error": "fileIds or fileId required"
}
```

## Database Schema

The pivot tables are automatically created by Sequelize with the following structure:

```sql
-- article_files
CREATE TABLE article_files (
  ArticleId INT UNSIGNED NOT NULL,
  FileId INT UNSIGNED NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (ArticleId, FileId),
  FOREIGN KEY (ArticleId) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (FileId) REFERENCES files(id) ON DELETE CASCADE
);

-- volunteer_files
CREATE TABLE volunteer_files (
  VolunteerId INT UNSIGNED NOT NULL,
  FileId INT UNSIGNED NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (VolunteerId, FileId),
  FOREIGN KEY (VolunteerId) REFERENCES volunteers(id) ON DELETE CASCADE,
  FOREIGN KEY (FileId) REFERENCES files(id) ON DELETE CASCADE
);

-- carousel_files
CREATE TABLE carousel_files (
  CarouselId INT UNSIGNED NOT NULL,
  FileId INT UNSIGNED NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (CarouselId, FileId),
  FOREIGN KEY (CarouselId) REFERENCES carousels(id) ON DELETE CASCADE,
  FOREIGN KEY (FileId) REFERENCES files(id) ON DELETE CASCADE
);
```

## Important Notes

1. **Authentication Required**: All POST, PUT, and DELETE operations require authentication
2. **Cascade Deletes**: When you delete an Article/Volunteer/Carousel, all pivot table records are automatically deleted
3. **File Deletion**: Deleting a File will also remove all its associations from pivot tables
4. **Duplicate Prevention**: The composite primary key prevents duplicate associations
5. **Include Files in Queries**: When fetching entities, files are automatically included in the response

## Testing

You can test these endpoints using curl:

```bash
# Add files to article
curl -X POST http://localhost:3000/api/articles/1/files \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileIds": [1, 2, 3]}'

# Remove files from volunteer
curl -X DELETE http://localhost:3000/api/volunteers/2/files \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileIds": [1]}'

# Replace all carousel files
curl -X PUT http://localhost:3000/api/carousel/1/files \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileIds": [5, 6, 7]}'
```
