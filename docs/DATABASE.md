# DATABASE.md - Database Schema & API Design

> Database schema, API endpoints, and data layer documentation.
> Last updated: 2026-01-23

## Table of Contents

1. [Domain Model](#domain-model)
2. [Database Schema](#database-schema)
3. [API Design](#api-design)
4. [Response Formats](#response-formats)

---

## Domain Model

```
┌─────────────────────────────────────────────────────────────────┐
│  CORE ENTITIES                                                  │
├─────────────────────────────────────────────────────────────────┤
│  CONTENT                                                        │
│  Post          - News articles with AI generation               │
│  Document      - PDFs organized by category                     │
│  Event         - Calendar events/announcements                  │
│  Page          - Static content pages (landmarks, info, etc.)   │
│  Gallery       - Photo albums                                   │
│  GalleryImage  - Individual photos in albums                    │
│                                                                 │
│  AUTH (Better Auth - standard tables)                           │
│  user          - Admin users with role extension                │
│  session       - Active login sessions                          │
│  account       - OAuth provider accounts (Google)               │
│  verification  - Email/password reset tokens                    │
│  passkey       - WebAuthn credentials (plugin)                  │
│  twoFactor     - TOTP 2FA secrets (plugin)                      │
│                                                                 │
│  COMMUNICATION                                                  │
│  ContactMessage    - Contact form submissions                   │
│  ProblemReport     - Citizen problem reports (tracked)          │
│  NewsletterSub     - Newsletter subscribers                     │
│  NewsletterSend    - Sent newsletter tracking                   │
│                                                                 │
│  SYSTEM                                                         │
│  AuditLog      - Who did what, when (via Better Auth plugin)    │
│  Embedding     - Vector embeddings for RAG chatbot              │
│  SearchIndex   - Denormalized search data                       │
│  Setting       - Site configuration key-value pairs             │
│  AiQueue       - Queued AI generation requests                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

**Database:** PostgreSQL with pgvector extension
**Auth:** Better Auth (standard schema + plugins)

> **Note on constraints:** The CHECK constraints shown in SQL examples below (e.g., `valid_role`, `valid_status`, `valid_category`) document the allowed values but are validated at the application layer, not the database layer. Prisma doesn't support CHECK constraints natively, so validation happens in the API routes and service layer. This approach provides better error messages and consistent validation across the stack.

### Better Auth Tables (Standard)

```sql
-- Users (Better Auth standard + custom role field)
user (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  emailVerified BOOLEAN DEFAULT FALSE,
  image TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP,
  -- Custom extension fields
  role TEXT DEFAULT 'staff',              -- 'super_admin', 'admin', 'staff'
  CONSTRAINT valid_role CHECK (role IN ('super_admin', 'admin', 'staff'))
)

-- Sessions (Better Auth standard)
session (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP
)

-- OAuth Accounts (Better Auth standard)
account (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,               -- 'google', 'credential'
  accessToken TEXT,
  refreshToken TEXT,
  accessTokenExpiresAt TIMESTAMP,
  refreshTokenExpiresAt TIMESTAMP,
  scope TEXT,
  idToken TEXT,
  password TEXT,                          -- For credential provider (hashed)
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP
)

-- Verification Tokens (Better Auth standard)
verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,               -- email or other identifier
  value TEXT NOT NULL,                    -- token value
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP
)
```

### Better Auth Plugin Tables

```sql
-- Passkeys (WebAuthn plugin)
passkey (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  name TEXT,                              -- User-friendly name "MacBook Touch ID"
  publicKey TEXT NOT NULL,
  credentialID TEXT UNIQUE NOT NULL,
  counter INTEGER DEFAULT 0,
  deviceType TEXT,                        -- 'platform' or 'cross-platform'
  backedUp BOOLEAN DEFAULT FALSE,
  transports TEXT,                        -- JSON array of transports
  createdAt TIMESTAMP DEFAULT NOW()
)

-- Two-Factor Auth (TOTP plugin)
twoFactor (
  id TEXT PRIMARY KEY,
  userId TEXT UNIQUE NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,                   -- Encrypted TOTP secret
  backupCodes TEXT,                       -- Encrypted backup codes (JSON)
  createdAt TIMESTAMP DEFAULT NOW()
)
```

### Content Tables

```sql
-- News/Posts
posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  content TEXT NOT NULL,                  -- Rich text (TipTap JSON)
  excerpt TEXT,                           -- Short summary
  featured_image VARCHAR,                 -- R2 URL
  images JSONB,                           -- Additional images [{url, caption}]
  category VARCHAR NOT NULL DEFAULT 'aktualnosti',
  is_featured BOOLEAN DEFAULT FALSE,
  facebook_post_id VARCHAR,               -- If posted to FB
  author_id TEXT REFERENCES user(id),
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  CONSTRAINT valid_category CHECK (category IN (
    'aktualnosti', 'gospodarstvo', 'sport',
    'komunalno', 'kultura', 'obrazovanje', 'ostalo'
  ))
)

-- Documents
documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  file_url VARCHAR NOT NULL,              -- R2 URL
  file_size INTEGER,
  category VARCHAR NOT NULL,              -- 'sjednice', 'izbori', 'planovi', etc.
  subcategory VARCHAR,
  year INTEGER,
  uploaded_by TEXT REFERENCES user(id),
  created_at TIMESTAMP DEFAULT NOW()
)

-- Events
events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  end_date DATE,                          -- For multi-day events
  location VARCHAR,
  poster_image VARCHAR,                   -- R2 URL
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
)

-- Static Pages
pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES pages(id),    -- For hierarchy
  menu_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
)

-- Galleries
galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  event_date DATE,
  description TEXT,
  cover_image VARCHAR,                    -- R2 URL
  created_at TIMESTAMP DEFAULT NOW()
)

-- Gallery Images
gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  image_url VARCHAR NOT NULL,             -- R2 URL (large)
  thumbnail_url VARCHAR,                  -- R2 URL (thumbnail)
  caption VARCHAR,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### Communication Tables

```sql
-- Contact Form Messages
contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  subject VARCHAR,
  message TEXT NOT NULL,
  status VARCHAR DEFAULT 'new',
  replied_at TIMESTAMP,
  replied_by TEXT REFERENCES user(id),
  ip_address VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('new', 'read', 'replied', 'archived'))
)

-- Problem Reports
problem_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_name VARCHAR,                  -- Optional (can be anonymous)
  reporter_email VARCHAR,                 -- Optional (for follow-up if provided)
  reporter_phone VARCHAR,                 -- Optional
  problem_type VARCHAR NOT NULL,
  location VARCHAR NOT NULL,
  description TEXT NOT NULL,
  images JSONB,                           -- [{url, caption}] R2 URLs
  status VARCHAR DEFAULT 'new',
  resolution_notes TEXT,
  resolved_at TIMESTAMP,
  resolved_by TEXT REFERENCES user(id),
  ip_address VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_type CHECK (problem_type IN ('cesta', 'rasvjeta', 'otpad', 'komunalno', 'ostalo')),
  CONSTRAINT valid_status CHECK (status IN ('new', 'in_progress', 'resolved', 'rejected'))
)

-- Newsletter Subscribers
newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  confirmed BOOLEAN DEFAULT FALSE,
  confirmation_token VARCHAR,
  confirmed_at TIMESTAMP,
  unsubscribed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Newsletter Sends (tracking)
newsletter_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject VARCHAR NOT NULL,
  content_html TEXT NOT NULL,
  content_text TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  recipient_count INTEGER,
  posts_included JSONB,                   -- [{id, title}]
  events_included JSONB,                  -- [{id, title}]
  is_manual BOOLEAN DEFAULT FALSE         -- vs automated weekly
)
```

### System Tables

```sql
-- Site Settings
settings (
  key VARCHAR PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
)

-- RAG Embeddings (for Chatbot)
embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type VARCHAR NOT NULL,           -- 'document', 'page', 'post'
  source_id UUID NOT NULL,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  embedding VECTOR(768),                  -- pgvector, nomic-embed-text size
  created_at TIMESTAMP DEFAULT NOW()
)

-- Search Index (denormalized for fast search)
search_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type VARCHAR NOT NULL,           -- 'post', 'document', 'page', 'event'
  source_id UUID NOT NULL,
  title VARCHAR NOT NULL,
  content_text TEXT NOT NULL,             -- Plain text for full-text search
  category VARCHAR,
  url VARCHAR NOT NULL,
  published_at TIMESTAMP,
  search_vector TSVECTOR,                 -- PostgreSQL full-text search
  embedding VECTOR(768),                  -- Semantic search
  updated_at TIMESTAMP DEFAULT NOW()
)

-- AI Generation Queue
ai_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES user(id),
  request_type VARCHAR NOT NULL,          -- 'post_generation', 'chat'
  input_data JSONB NOT NULL,              -- Request payload
  status VARCHAR DEFAULT 'pending',
  result JSONB,                           -- Response when complete
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
)
```

### Indexes

```sql
-- Indexes (Better Auth)
CREATE INDEX idx_session_user ON session(userId);
CREATE INDEX idx_session_token ON session(token);
CREATE INDEX idx_account_user ON account(userId);
CREATE INDEX idx_passkey_user ON passkey(userId);
CREATE INDEX idx_passkey_credential ON passkey(credentialID);

-- Indexes (Content)
CREATE INDEX idx_posts_published ON posts(published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_featured ON posts(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_documents_category ON documents(category, year DESC);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_galleries_date ON galleries(event_date DESC);
CREATE INDEX idx_gallery_images_gallery ON gallery_images(gallery_id, sort_order);
CREATE INDEX idx_pages_parent ON pages(parent_id);

-- Indexes (Communication)
CREATE INDEX idx_contact_status ON contact_messages(status, created_at DESC);
CREATE INDEX idx_problems_status ON problem_reports(status, created_at DESC);
CREATE INDEX idx_newsletter_confirmed ON newsletter_subscribers(confirmed) WHERE confirmed = TRUE;

-- Indexes (System)
CREATE INDEX idx_embeddings_source ON embeddings(source_type, source_id);
CREATE INDEX idx_ai_queue_status ON ai_queue(status, created_at);

-- Indexes (Search)
CREATE INDEX idx_search_source ON search_index(source_type, source_id);
CREATE INDEX idx_search_fulltext ON search_index USING GIN(search_vector);
CREATE INDEX idx_search_embedding ON search_index USING hnsw(embedding vector_cosine_ops);
```

---

## API Design

**Style:** REST (simple, sufficient for this project)
**Auth:** Better Auth handles `/api/auth/*` routes automatically

### Authentication (Better Auth - auto-generated)

```
POST   /api/auth/sign-up              - Email/password registration
POST   /api/auth/sign-in/email        - Email/password login
POST   /api/auth/sign-in/social       - OAuth login (Google)
POST   /api/auth/sign-out             - Logout
GET    /api/auth/session              - Get current session
POST   /api/auth/forget-password      - Request password reset
POST   /api/auth/reset-password       - Reset password with token
POST   /api/auth/verify-email         - Verify email address

-- Passkey Plugin
POST   /api/auth/passkey/register     - Register new passkey
POST   /api/auth/passkey/authenticate - Login with passkey

-- Two-Factor Plugin
POST   /api/auth/two-factor/enable    - Enable 2FA
POST   /api/auth/two-factor/disable   - Disable 2FA
POST   /api/auth/two-factor/verify    - Verify TOTP code
```

### User Management (Admin/Super Admin)

```
GET    /api/users                   - List users
POST   /api/users                   - Create user (invite)
PUT    /api/users/:id               - Update user
DELETE /api/users/:id               - Delete user (super admin only)
GET    /api/users/:id/sessions      - View user sessions
DELETE /api/users/:id/sessions/:sid - Revoke session
```

### Posts

```
GET    /api/posts              - List (paginated, filterable)
GET    /api/posts/:slug        - Get single
POST   /api/posts              - Create
PUT    /api/posts/:id          - Update
DELETE /api/posts/:id          - Delete (admin only)
POST   /api/posts/:id/publish  - Publish (triggers build + FB post)
```

### Documents

```
GET    /api/documents          - List (filterable by category, year)
POST   /api/documents          - Upload to R2
PUT    /api/documents/:id      - Update metadata
DELETE /api/documents/:id      - Delete from R2
```

### Events

```
GET    /api/events             - List (with calendar view support)
GET    /api/events/:id         - Get single
POST   /api/events             - Create
PUT    /api/events/:id         - Update
DELETE /api/events/:id         - Delete
```

### Galleries

```
GET    /api/galleries          - List albums
GET    /api/galleries/:slug    - Get album with images
POST   /api/galleries          - Create album
PUT    /api/galleries/:id      - Update album
DELETE /api/galleries/:id      - Delete album + images from R2
POST   /api/galleries/:id/images - Upload images to R2
PUT    /api/galleries/:id/reorder - Reorder images
DELETE /api/galleries/:id/images/:imgId - Delete image from R2
```

### Pages

```
GET    /api/pages              - List (with hierarchy)
GET    /api/pages/:slug        - Get single
POST   /api/pages              - Create
PUT    /api/pages/:id          - Update
DELETE /api/pages/:id          - Delete
```

### Settings

```
GET    /api/settings           - Get all settings
GET    /api/settings/:key      - Get single setting
PUT    /api/settings/:key      - Update setting
```

### Contact & Problem Reports

```
GET    /api/contact            - List contact messages (admin)
PUT    /api/contact/:id        - Update status
DELETE /api/contact/:id        - Archive/delete message

GET    /api/problems           - List problem reports (admin)
GET    /api/problems/:id       - Get single with images
PUT    /api/problems/:id       - Update status, add notes
DELETE /api/problems/:id       - Delete report
```

### Public (No Auth Required)

```
POST   /api/public/contact     - Submit contact form
POST   /api/public/problem     - Submit problem report + images
POST   /api/public/newsletter/subscribe   - Subscribe to newsletter
GET    /api/public/newsletter/confirm/:token - Confirm email
GET    /api/public/newsletter/unsubscribe/:token - Unsubscribe
```

### Newsletter (Admin)

```
GET    /api/newsletter/subscribers - List subscribers
DELETE /api/newsletter/subscribers/:id - Remove subscriber
POST   /api/newsletter/send    - Send manual newsletter
GET    /api/newsletter/sends   - List sent newsletters
POST   /api/newsletter/preview - Preview newsletter content
```

### Search

```
GET    /api/search             - Hybrid search (keyword + semantic)
GET    /api/search/suggest     - Search suggestions (autocomplete)
```

### AI

```
POST   /api/ai/generate        - Queue content generation
GET    /api/ai/generate/:id    - Check generation status
POST   /api/ai/chat            - Chatbot query (RAG)
```

### Build & Deploy

```
POST   /api/build/trigger      - Trigger Cloudflare Pages rebuild
GET    /api/build/status       - Check build status
GET    /api/build/history      - List recent builds
```

### Analytics

```
GET    /api/analytics/summary  - Dashboard stats from Cloudflare
GET    /api/analytics/visitors - Visitor data
GET    /api/analytics/pages    - Top pages
```

### Upload (R2)

```
POST   /api/upload/image       - Upload image to R2 (returns URL)
POST   /api/upload/document    - Upload document to R2
DELETE /api/upload/:key        - Delete file from R2
```

---

## Response Formats

### Success Response

```typescript
// Single item
{
  success: true,
  data: { ... }
}

// List with pagination
{
  success: true,
  data: [...],
  pagination: {
    page: 1,
    limit: 20,
    total: 150,
    totalPages: 8
  }
}
```

### Error Response

```typescript
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Naslov je obavezan",     // Croatian, user-friendly
    details?: { field: "title" }        // Optional technical details
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Not logged in |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `AI_QUEUE_FULL` | 429 | AI generation queue full |
| `SERVER_ERROR` | 500 | Internal server error |
