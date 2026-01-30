/**
 * Ollama Cloud client for LLM text generation
 * Handles authentication, retries, and rate limiting
 */

import { aiLogger } from '../logger';

import type {
  AiResponse,
  OllamaCloudConfig,
  OllamaGenerateRequest,
  OllamaGenerateResponse,
  OllamaHealthStatus,
  OllamaModelsResponse,
} from './types';

// =============================================================================
// Configuration
// =============================================================================

const DEFAULT_CONFIG: Omit<OllamaCloudConfig, 'apiKey'> = {
  baseUrl: 'https://api.ollama.com',
  model: 'deepseek-v3.2',
  maxRetries: 3,
  retryDelayMs: 30000, // 30 seconds base delay
};

function getConfig(): OllamaCloudConfig {
  const apiKey = process.env.OLLAMA_CLOUD_API_KEY;

  if (!apiKey) {
    throw new Error('OLLAMA_CLOUD_API_KEY environment variable is not set');
  }

  return {
    apiKey,
    baseUrl: process.env.OLLAMA_CLOUD_URL || DEFAULT_CONFIG.baseUrl,
    model: process.env.OLLAMA_CLOUD_MODEL || DEFAULT_CONFIG.model,
    maxRetries: DEFAULT_CONFIG.maxRetries,
    retryDelayMs: DEFAULT_CONFIG.retryDelayMs,
  };
}

// =============================================================================
// HTTP Helpers
// =============================================================================

async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const config = getConfig();

  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
      ...options.headers,
    },
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// =============================================================================
// Retry Logic
// =============================================================================

async function withRetry<T>(
  operation: () => Promise<AiResponse<T>>,
  context: string
): Promise<AiResponse<T>> {
  const config = getConfig();
  let lastError: AiResponse<T> | null = null;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    const result = await operation();

    if (result.success) {
      return result;
    }

    lastError = result;

    // Don't retry on auth errors or model not found
    if (result.error.code === 'AUTH_ERROR' || result.error.code === 'MODEL_NOT_FOUND') {
      aiLogger.error(
        { code: result.error.code, context },
        `Non-retryable error: ${result.error.message}`
      );
      return result;
    }

    // Calculate exponential backoff delay
    const delay = config.retryDelayMs * Math.pow(2, attempt - 1);

    aiLogger.warn(
      { attempt, maxRetries: config.maxRetries, delay, context, code: result.error.code },
      `Retrying after ${delay}ms (attempt ${attempt}/${config.maxRetries})`
    );

    if (attempt < config.maxRetries) {
      await sleep(delay);
    }
  }

  aiLogger.error(
    { context, attempts: config.maxRetries },
    `All retry attempts exhausted`
  );

  return lastError!;
}

// =============================================================================
// API Methods
// =============================================================================

/**
 * Check if Ollama Cloud is configured
 */
export function isOllamaCloudConfigured(): boolean {
  return !!process.env.OLLAMA_CLOUD_API_KEY;
}

/**
 * Get the configured model name
 */
export function getConfiguredModel(): string {
  return process.env.OLLAMA_CLOUD_MODEL || DEFAULT_CONFIG.model;
}

/**
 * List available models
 */
export async function listModels(): Promise<AiResponse<OllamaModelsResponse>> {
  const config = getConfig();

  try {
    const response = await fetchWithAuth(`${config.baseUrl}/api/tags`);

    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        error: {
          code: 'AUTH_ERROR',
          message: 'Invalid or expired API key',
        },
      };
    }

    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
      return {
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Rate limit exceeded',
          retryAfter,
        },
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN',
          message: `API error: ${response.status} ${response.statusText}`,
        },
      };
    }

    const data = await response.json() as OllamaModelsResponse;
    return { success: true, data };
  } catch (error) {
    aiLogger.error({ error }, 'Failed to list models');
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network error',
      },
    };
  }
}

/**
 * Generate text using Ollama Cloud LLM
 * Includes automatic retry with exponential backoff
 */
export async function generate(
  prompt: string,
  options: {
    system?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<AiResponse<OllamaGenerateResponse>> {
  const config = getConfig();

  const operation = async (): Promise<AiResponse<OllamaGenerateResponse>> => {
    try {
      const request: OllamaGenerateRequest = {
        model: config.model,
        prompt,
        stream: false,
        ...(options.system && { system: options.system }),
        options: {
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 2048,
        },
      };

      const response = await fetchWithAuth(`${config.baseUrl}/api/generate`, {
        method: 'POST',
        body: JSON.stringify(request),
      });

      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          error: {
            code: 'AUTH_ERROR',
            message: 'Invalid or expired API key',
          },
        };
      }

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
        return {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Rate limit exceeded',
            retryAfter,
          },
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          error: {
            code: 'MODEL_NOT_FOUND',
            message: `Model ${config.model} not found`,
          },
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: 'UNKNOWN',
            message: `API error: ${response.status} ${response.statusText}`,
          },
        };
      }

      const data = await response.json() as OllamaGenerateResponse;

      aiLogger.info(
        {
          model: data.model,
          promptTokens: data.prompt_eval_count,
          completionTokens: data.eval_count,
          durationMs: data.total_duration ? data.total_duration / 1_000_000 : null,
        },
        'Generation completed'
      );

      return { success: true, data };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: {
            code: 'TIMEOUT',
            message: 'Request timed out',
          },
        };
      }

      aiLogger.error({ error }, 'Generation request failed');
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
        },
      };
    }
  };

  return withRetry(operation, 'generate');
}

/**
 * Check Ollama Cloud health and connectivity
 */
export async function checkHealth(): Promise<OllamaHealthStatus> {
  const checkedAt = new Date().toISOString();
  const model = getConfiguredModel();

  if (!isOllamaCloudConfigured()) {
    return {
      connected: false,
      model,
      modelAvailable: false,
      latencyMs: null,
      error: 'OLLAMA_CLOUD_API_KEY not configured',
      checkedAt,
    };
  }

  const startTime = Date.now();

  try {
    const result = await listModels();
    const latencyMs = Date.now() - startTime;

    if (!result.success) {
      return {
        connected: false,
        model,
        modelAvailable: false,
        latencyMs,
        error: result.error.message,
        checkedAt,
      };
    }

    const modelPrefix = model.split(':')[0];
    const modelAvailable = result.data.models.some(
      m => m.name === model || (modelPrefix && m.name.startsWith(modelPrefix))
    );

    return {
      connected: true,
      model,
      modelAvailable,
      latencyMs,
      error: null,
      checkedAt,
    };
  } catch (error) {
    return {
      connected: false,
      model,
      modelAvailable: false,
      latencyMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      checkedAt,
    };
  }
}
