/**
 * AI services module
 * - Ollama Cloud: LLM text generation (Llama 3.1 70B)
 * - Local Ollama: Embeddings (nomic-embed-text) - handled separately in search
 * - Queue Worker: Background job processing
 * - Document Parser: Extract text from PDF, DOCX, and images
 */

// Ollama Cloud client
export {
  isOllamaCloudConfigured,
  getConfiguredModel,
  listModels,
  generate,
  checkHealth,
} from './ollama-cloud';

// Queue Worker
export {
  startQueueWorker,
  stopQueueWorker,
  isWorkerRunning,
  triggerProcessing,
} from './queue-worker';

// Document Parser
export {
  parseDocument,
  isSupportedMimeType,
  getSupportedMimeTypes,
} from './document-parser';

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

export type {
  ParseResult,
  ParseSuccessResult,
  ParseFailureResult,
  SupportedMimeType,
} from './document-parser';

// Pipeline
export { runArticlePipeline } from './pipeline';
export type { ReviewResult, ReviewScores, ReviewIssue } from './prompts';
export { PIPELINE_CONFIG } from './prompts';
