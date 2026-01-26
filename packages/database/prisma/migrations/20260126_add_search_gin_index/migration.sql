-- Add unique constraint on search_index (source_type, source_id)
-- This allows upsert operations during indexing
CREATE UNIQUE INDEX IF NOT EXISTS "search_index_source_type_source_id_key"
ON "search_index"("source_type", "source_id");

-- Drop the non-unique index if it exists (superseded by unique index)
DROP INDEX IF EXISTS "search_index_source_type_source_id_idx";

-- Create GIN index for full-text search on search_vector
CREATE INDEX IF NOT EXISTS "idx_search_index_vector"
ON "search_index" USING gin("search_vector");
