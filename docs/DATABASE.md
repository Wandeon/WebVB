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
│  AUTH & USERS                                                   │
│  User          - Admin users (Super Admin, Admin, Staff)        │
│  UserSession   - Active login sessions                          │
│  UserPasskey   - WebAuthn/passkey credentials                   │
│  UserTOTP      - 2FA secrets                                    │
│                                                                 │
│  COMMUNICATION                                                  │
│  ContactMessage    - Contact form submissions                   │
│  ProblemReport     - Citizen problem reports (tracked)          │
│  NewsletterSub     - Newsletter subscribers                     │
│  NewsletterSend    - Sent newsletter tracking                   │
│                                                                 │
│  SYSTEM                                                         │
│  AuditLog      - Who did what, when (security)                  │
│  Embedding     - Vector embeddings for RAG chatbot              │
│  SearchIndex   - Denormalized search data                       │
│  Setting       - Site configuration key-value pairs             │
└─────────────────────────────────────────────────────────────────┘
```

**Total Tables:** 19

---

## Database Schema

**Database:** PostgreSQL with pgvector extension

### Users & Auth

```sql
-- Users
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  role ENUM('super_admin', 'admin', 'staff') NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
)

-- User Sessions (for session management)
user_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR UNIQUE NOT NULL,
  device_info VARCHAR,            -- Browser, OS info
  ip_address VARCHAR,
  last_active TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Passkeys (WebAuthn credentials)
user_passkeys (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  credential_id VARCHAR UNIQUE NOT NULL,
  public_key BYTEA NOT NULL,
  counter INTEGER DEFAULT 0,
  device_type VARCHAR,            -- 'platform' or 'cross-platform'
  name VARCHAR,                   -- User-friendly name "MacBook Touch ID"
  last_used TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
)

-- TOTP 2FA Secrets
user_totp (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  secret_encrypted VARCHAR NOT NULL,
  enabled BOOLEAN DEFAULT FALSE,
  backup_codes JSONB,             -- Encrypted backup codes
  created_at TIMESTAMP DEFAULT NOW()
)
```

### Content

```sql
-- News/Posts
posts (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  content TEXT NOT NULL,           -- Rich text (TipTap JSON or HTML)
  excerpt TEXT,                    -- Short summary
  featured_image VARCHAR,          -- URL
  images JSONB,                    -- Additional images [{url, caption}]
  category ENUM('aktualnosti', 'gospodarstvo', 'sport',
                'komunalno', 'kultura', 'obrazovanje', 'ostalo'),
  is_featured BOOLEAN DEFAULT FALSE,
  facebook_post_id VARCHAR,        -- If posted to FB
  author_id UUID REFERENCES users(id),
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
)

-- Documents
documents (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  file_url VARCHAR NOT NULL,
  file_size INTEGER,
  category VARCHAR NOT NULL,       -- 'sjednice', 'izbori', 'planovi', etc.
  subcategory VARCHAR,
  year INTEGER,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
)

-- Events
events (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  location VARCHAR,
  poster_image VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
)

-- Static Pages
pages (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES pages(id),  -- For hierarchy
  menu_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
)

-- Galleries
galleries (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  event_date DATE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)

gallery_images (
  id UUID PRIMARY KEY,
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
  image_url VARCHAR NOT NULL,
  thumbnail_url VARCHAR,
  caption VARCHAR,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### Communication

```sql
-- Contact Form Messages
contact_messages (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  subject VARCHAR,
  message TEXT NOT NULL,
  status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
  replied_at TIMESTAMP,
  replied_by UUID REFERENCES users(id),
  ip_address VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Problem Reports
problem_reports (
  id UUID PRIMARY KEY,
  reporter_name VARCHAR,           -- Optional (can be anonymous)
  reporter_email VARCHAR,          -- Optional
  reporter_phone VARCHAR,          -- Optional
  problem_type VARCHAR NOT NULL,   -- 'cesta', 'rasvjeta', 'otpad', 'ostalo'
  location VARCHAR NOT NULL,
  description TEXT NOT NULL,
  images JSONB,                    -- [{url, caption}]
  status ENUM('new', 'in_progress', 'resolved', 'rejected') DEFAULT 'new',
  resolution_notes TEXT,
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES users(id),
  ip_address VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Newsletter Subscribers
newsletter_subscribers (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  confirmed BOOLEAN DEFAULT FALSE,
  confirmation_token VARCHAR,
  confirmed_at TIMESTAMP,
  unsubscribed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Newsletter Sends (tracking)
newsletter_sends (
  id UUID PRIMARY KEY,
  subject VARCHAR NOT NULL,
  content_html TEXT NOT NULL,
  content_text TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  recipient_count INTEGER,
  posts_included JSONB,           -- [{id, title}]
  events_included JSONB,          -- [{id, title}]
  is_manual BOOLEAN DEFAULT FALSE -- vs automated weekly
)
```

### System

```sql
-- Audit Log (Security)
audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR NOT NULL,         -- 'create', 'update', 'delete', 'login'
  entity_type VARCHAR NOT NULL,    -- 'post', 'document', etc.
  entity_id UUID,
  details JSONB,                   -- Additional context
  ip_address VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
)

-- RAG Embeddings (for Chatbot)
embeddings (
  id UUID PRIMARY KEY,
  source_type VARCHAR NOT NULL,    -- 'document', 'page', 'post'
  source_id UUID NOT NULL,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  embedding VECTOR(384),           -- pgvector, size depends on model
  created_at TIMESTAMP DEFAULT NOW()
)

-- Site Settings
settings (
  key VARCHAR PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
)

-- Search Index (denormalized for fast search)
search_index (
  id UUID PRIMARY KEY,
  source_type VARCHAR NOT NULL,   -- 'post', 'document', 'page', 'event'
  source_id UUID NOT NULL,
  title VARCHAR NOT NULL,
  content_text TEXT NOT NULL,     -- Plain text for full-text search
  category VARCHAR,
  url VARCHAR NOT NULL,
  published_at TIMESTAMP,
  search_vector TSVECTOR,         -- PostgreSQL full-text search
  embedding VECTOR(384),          -- Semantic search
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Indexes

```sql
-- Indexes (Content)
CREATE INDEX idx_posts_published ON posts(published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_featured ON posts(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_documents_category ON documents(category, year DESC);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_galleries_date ON galleries(event_date DESC);

-- Indexes (Auth)
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_passkeys_user ON user_passkeys(user_id);
CREATE INDEX idx_passkeys_credential ON user_passkeys(credential_id);

-- Indexes (Communication)
CREATE INDEX idx_contact_status ON contact_messages(status, created_at DESC);
CREATE INDEX idx_problems_status ON problem_reports(status, created_at DESC);
CREATE INDEX idx_newsletter_confirmed ON newsletter_subscribers(confirmed) WHERE confirmed = TRUE;

-- Indexes (System)
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_embeddings_source ON embeddings(source_type, source_id);

-- Indexes (Search)
CREATE INDEX idx_search_source ON search_index(source_type, source_id);
CREATE INDEX idx_search_fulltext ON search_index USING GIN(search_vector);
CREATE INDEX idx_search_embedding ON search_index USING ivfflat(embedding vector_cosine_ops);
```

---

## API Design

**Style:** REST (simple, sufficient for this project)

### Authentication

```
POST   /api/auth/login              - Email/password login
POST   /api/auth/logout             - Logout (invalidate session)
GET    /api/auth/me                 - Get current user
POST   /api/auth/google             - Google OAuth callback
POST   /api/auth/passkey/register   - Register new passkey
POST   /api/auth/passkey/login      - Login with passkey
POST   /api/auth/password/reset     - Request password reset
POST   /api/auth/password/confirm   - Confirm password reset
POST   /api/auth/2fa/setup          - Setup TOTP 2FA
POST   /api/auth/2fa/verify         - Verify TOTP code
DELETE /api/auth/2fa                - Disable 2FA
```

### User Management (Admin/Super Admin)

```
GET    /api/users                   - List users
POST   /api/users                   - Create user
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
POST   /api/posts/generate     - AI generate from notes/images
```

### Documents

```
GET    /api/documents          - List (filterable by category, year)
POST   /api/documents          - Upload
DELETE /api/documents/:id      - Delete
```

### Events

```
GET    /api/events             - List (with calendar view support)
POST   /api/events             - Create
PUT    /api/events/:id         - Update
DELETE /api/events/:id         - Delete
```

### Galleries

```
GET    /api/galleries          - List albums
POST   /api/galleries          - Create album
PUT    /api/galleries/:id      - Update album
DELETE /api/galleries/:id      - Delete album
POST   /api/galleries/:id/images - Upload images
PUT    /api/galleries/:id/reorder - Reorder images
DELETE /api/galleries/:id/images/:imgId - Delete image
```

### Pages

```
GET    /api/pages              - List (with hierarchy)
POST   /api/pages              - Create
PUT    /api/pages/:id          - Update
DELETE /api/pages/:id          - Delete
```

### Contact & Problem Reports

```
GET    /api/contact            - List contact messages (admin)
PUT    /api/contact/:id        - Update status
DELETE /api/contact/:id        - Archive/delete message
GET    /api/problems           - List problem reports (admin)
PUT    /api/problems/:id       - Update status, add notes
```

### Public (No Auth Required)

```
POST   /api/public/contact     - Submit contact form
POST   /api/public/problem     - Submit problem report
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
```

### Search

```
GET    /api/search             - Hybrid search (keyword + semantic)
GET    /api/search/suggest     - Search suggestions
```

### AI

```
POST   /api/ai/generate        - Generate content from input
POST   /api/ai/chat            - Chatbot query
```

### Build & Deploy

```
POST   /api/build/trigger      - Trigger site rebuild
GET    /api/build/status       - Check build status
```

### Analytics

```
GET    /api/analytics/summary  - Dashboard stats from Cloudflare
GET    /api/analytics/visitors - Visitor data
GET    /api/analytics/pages    - Top pages
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
| `SERVER_ERROR` | 500 | Internal server error |
