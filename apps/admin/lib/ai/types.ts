/**
 * AI service types for Ollama Cloud and local Ollama
 */

// =============================================================================
// Ollama Cloud Types (LLM Generation)
// =============================================================================

export interface OllamaCloudConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxRetries: number;
  retryDelayMs: number;
  requestTimeoutMs: number;
}

export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  system?: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
  };
}

export interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaModelInfo {
  name: string;
  modified_at: string;
  size: number;
}

export interface OllamaModelsResponse {
  models: OllamaModelInfo[];
}

// =============================================================================
// AI Client Result Types
// =============================================================================

export interface AiResult<T> {
  success: true;
  data: T;
}

export interface AiError {
  success: false;
  error: {
    code: 'RATE_LIMITED' | 'AUTH_ERROR' | 'MODEL_NOT_FOUND' | 'NETWORK_ERROR' | 'TIMEOUT' | 'UNKNOWN';
    message: string;
    retryAfter?: number;
  };
}

export type AiResponse<T> = AiResult<T> | AiError;

// =============================================================================
// Health Check Types
// =============================================================================

export interface OllamaHealthStatus {
  connected: boolean;
  model: string;
  modelAvailable: boolean;
  latencyMs: number | null;
  error: string | null;
  checkedAt: string;
}
