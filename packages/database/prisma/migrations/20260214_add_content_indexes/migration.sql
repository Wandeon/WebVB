-- Add composite index for published content listing by category
CREATE INDEX IF NOT EXISTS "idx_posts_category_published_at"
ON "posts"("category", "published_at" DESC);

-- Add composite index for announcements listing by category
CREATE INDEX IF NOT EXISTS "idx_announcements_category_published_at"
ON "announcements"("category", "published_at" DESC);
