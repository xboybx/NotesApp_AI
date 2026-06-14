# Database Integration & Mongoose Setup

## Overview
NoteWise AI uses MongoDB with Mongoose as the ODM (Object-Document Mapper) for all data persistence. This document covers the database architecture, connection setup, and models.

## MongoDB Connection (`/lib/db/mongodb.ts`)
The database connection is established once and reused across requests (connection pooling).

### Connection Logic
```typescript
// Singleton pattern to avoid multiple connections
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI);
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}
```

### Environment Variable
Required: `MONGODB_URI` in `.env` file
- Connection string to your MongoDB instance (local or Atlas)
- Example: `mongodb://localhost:27017/notewise-ai` or Atlas connection string

## Mongoose Models

### User Model (`/lib/db/user.model.ts`)
Matches the Better Auth user schema for authentication.

**Schema Definition:**
```typescript
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, required: true, unique: true },
  image: String,
  emailVerified: Boolean,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
```

### Page Model (`/lib/db/page.model.ts`)
The primary model for storing notes/pages.

**Schema Definition:**
```typescript
const pageSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true }, // Index for fast user queries
  title: { type: String, default: "Untitled" },
  icon: String,
  coverImage: String,
  content: { type: Array, default: [] }, // BlockNote JSON blocks
  tags: { type: [String], default: [] },
  summary: String,
  isFavorite: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for performance
pageSchema.index({ userId: 1, isArchived: 1, updatedAt: -1 });
```

### Indexes & Performance
Key indexes created for fast queries:
- `userId`: All queries are scoped to a single user
- `{ userId: 1, isArchived: 1, updatedAt: -1 }`: Compound index for sidebar listing
- This makes "get all non-archived pages for user sorted by date" very fast

## Database Operations

### In Pages API Routes (`/lib/hono/routes/pages.routes.ts`)
All CRUD operations use Mongoose queries:

**List all pages:**
```typescript
const pages = await Page.find({ userId: c.get("user").id, isArchived: false })
  .sort({ updatedAt: -1 })
  .select("-content"); // Exclude heavy content field for list view
```

**Get single page:**
```typescript
const page = await Page.findOne({ _id: id, userId: c.get("user").id });
```

**Create page:**
```typescript
const page = await Page.create({
  userId: c.get("user").id,
  title: data.title || "Untitled",
  icon: data.icon || null,
});
```

**Update page:**
```typescript
const page = await Page.findOneAndUpdate(
  { _id: id, userId: c.get("user").id },
  { ...data, updatedAt: new Date() },
  { new: true } // Return the updated document
);
```

**Toggle favorite/archive:**
```typescript
const page = await Page.findOne({ _id: id, userId: c.get("user").id });
page.isFavorite = !page.isFavorite;
await page.save();
```

**Permanent delete:**
```typescript
// Only allowed if page is archived
await Page.findOneAndDelete({ _id: id, userId: c.get("user").id, isArchived: true });
```

## Data Migration & Updates
When the schema changes, existing documents automatically use defaults:
- `isFavorite` defaults to false for older pages
- `isArchived` defaults to false
- `updatedAt` is automatically set on every save

## Better Auth Integration
Better Auth uses the same MongoDB connection and User model:
- Mongoose adapter configured in Better Auth
- Shares the same database and collections
- Consistent user data across the entire application

## Multi-tenant Architecture
Every document is scoped to a `userId`, ensuring:
- Users can only access their own data
- No cross-user data leaks
- Easy horizontal scaling
- Simple query patterns (always filter by userId)