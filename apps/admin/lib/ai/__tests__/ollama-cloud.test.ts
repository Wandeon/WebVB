/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  checkHealth,
  generate,
  getConfiguredModel,
  isOllamaCloudConfigured,
  listModels,
} from '../ollama-cloud';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ollama-cloud', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      OLLAMA_CLOUD_API_KEY: 'test-api-key',
      OLLAMA_CLOUD_URL: 'https://api.ollama.com',
      OLLAMA_CLOUD_MODEL: 'deepseek-v3.2',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('isOllamaCloudConfigured', () => {
    it('returns true when API key is set', () => {
      expect(isOllamaCloudConfigured()).toBe(true);
    });

    it('returns false when API key is not set', () => {
      delete process.env.OLLAMA_CLOUD_API_KEY;
      expect(isOllamaCloudConfigured()).toBe(false);
    });
  });

  describe('getConfiguredModel', () => {
    it('returns configured model', () => {
      expect(getConfiguredModel()).toBe('deepseek-v3.2');
    });

    it('returns default model when not configured', () => {
      delete process.env.OLLAMA_CLOUD_MODEL;
      expect(getConfiguredModel()).toBe('deepseek-v3.2');
    });
  });

  describe('listModels', () => {
    it('returns models on success', async () => {
      const modelsPayload = {
        models: [
          { name: 'deepseek-v3.2', modified_at: '2024-01-01', size: 1000 },
        ],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(modelsPayload)),
        json: () => Promise.resolve(modelsPayload),
      });

      const result = await listModels();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.models).toHaveLength(1);
        expect(result.data.models[0]?.name).toBe('deepseek-v3.2');
      }
    });

    it('returns AUTH_ERROR on 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const result = await listModels();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('AUTH_ERROR');
      }
    });

    it('returns RATE_LIMITED on 429', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Headers({ 'Retry-After': '60' }),
      });

      const result = await listModels();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('RATE_LIMITED');
        expect(result.error.retryAfter).toBe(60);
      }
    });
  });

  describe('generate', () => {
    it('returns generated text on success', async () => {
      const generatePayload = {
        model: 'deepseek-v3.2',
        created_at: '2024-01-01T00:00:00Z',
        response: 'Generated text here',
        done: true,
        total_duration: 1000000000,
        prompt_eval_count: 10,
        eval_count: 20,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(generatePayload)),
        json: () => Promise.resolve(generatePayload),
      });

      const result = await generate('Test prompt');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.response).toBe('Generated text here');
        expect(result.data.done).toBe(true);
      }
    });

    it('includes system prompt when provided', async () => {
      const systemPayload = {
        model: 'deepseek-v3.2',
        response: 'Generated text',
        done: true,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(systemPayload)),
        json: () => Promise.resolve(systemPayload),
      });

      await generate('Test prompt', { system: 'You are a helpful assistant' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('You are a helpful assistant'),
        })
      );
    });

    it('returns MODEL_NOT_FOUND on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await generate('Test prompt');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('MODEL_NOT_FOUND');
      }
    });

    it('does not retry on AUTH_ERROR', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
      });

      await generate('Test prompt');

      // Should only be called once (no retries for auth errors)
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkHealth', () => {
    it('returns healthy status when connected', async () => {
      const healthPayload = {
        models: [{ name: 'deepseek-v3.2', modified_at: '2024-01-01', size: 1000 }],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(healthPayload)),
        json: () => Promise.resolve(healthPayload),
      });

      const health = await checkHealth();

      expect(health.connected).toBe(true);
      expect(health.modelAvailable).toBe(true);
      expect(health.error).toBeNull();
      expect(health.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('returns not configured when API key missing', async () => {
      delete process.env.OLLAMA_CLOUD_API_KEY;

      const health = await checkHealth();

      expect(health.connected).toBe(false);
      expect(health.error).toContain('not configured');
    });

    it('reports model unavailable when not in list', async () => {
      const otherModelPayload = {
        models: [{ name: 'other-model', modified_at: '2024-01-01', size: 1000 }],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(otherModelPayload)),
        json: () => Promise.resolve(otherModelPayload),
      });

      const health = await checkHealth();

      expect(health.connected).toBe(true);
      expect(health.modelAvailable).toBe(false);
    });
  });
});
