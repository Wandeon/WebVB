/**
 * AI services module
 * - Ollama Cloud: LLM text generation (Llama 3.1 70B)
 * - Local Ollama: Embeddings (nomic-embed-text) - handled separately in search
 */

// Ollama Cloud client
export {
  isOllamaCloudConfigured,
  getConfiguredModel,
  listModels,
  generate,
  checkHealth,
} from './ollama-cloud';

// Types
export type {
  OllamaCloudConfig,
  OllamaGenerateRequest,
  OllamaGenerateResponse,
  OllamaHealthStatus,
  OllamaModelsResponse,
  AiResponse,
  AiResult,
  AiError,
} from './types';
