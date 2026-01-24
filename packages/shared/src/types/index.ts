// Common types used across apps
// These mirror the Prisma schema for use in frontend code

export type UserRole = 'super_admin' | 'admin' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// PostCategory is now exported from constants/categories.ts
// Re-export it here for backwards compatibility
export type { PostCategory } from '../constants/categories';

export type ProblemType = 'cesta' | 'rasvjeta' | 'otpad' | 'komunalno' | 'ostalo';

export type ContactStatus = 'new' | 'read' | 'replied' | 'archived';

export type ProblemStatus = 'new' | 'in_progress' | 'resolved' | 'rejected';

export type AiQueueStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ImageData {
  url: string;
  caption?: string;
}
