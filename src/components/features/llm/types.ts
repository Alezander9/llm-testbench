export type LLMProvider = "openai" | "deepseek" | "anthropic";

// Provider configurations
export type ProviderConfigs = {
  openai: ProviderConfig;
  deepseek?: ProviderConfig;
  anthropic?: ProviderConfig;
};

export interface ModelConfig {
  provider: LLMProvider;
  modelId: string;
  maxTokens?: number;
  temperature?: number;
}

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export type StreamingLLMResponse = {
  stream: AsyncIterable<string>;
};

// Provider-specific configurations
export interface ProviderConfig {
  apiKey: string;
  apiEndpoint?: string;
  organizationId?: string;
}

// Base interface that all provider implementations must follow
export interface FileUploadResponse {
  id: string;
  size: number;
  type: string;
  name: string;
}

export interface VectorStore {
  id: string;
  status: {
    inProgress: number;
    completed: number;
    failed: number;
  };
}

// OpenAI specific type
export interface OpenAIVectorStore extends VectorStore {
  file_ids: string[];
}

export interface LLMProviderInterface {
  // Basic completion methods
  generateCompletion(
    messages: Message[],
    modelConfig: ModelConfig
  ): Promise<LLMResponse>;

  generateStream(
    messages: Message[],
    modelConfig: ModelConfig
  ): Promise<StreamingLLMResponse>;

  // File handling methods
  uploadFile?(file: {
    data: Uint8Array;
    name: string;
    type: string;
  }): Promise<FileUploadResponse>;

  createVectorStore?(
    file_ids: string[],
    options?: { expiresInDays?: number }
  ): Promise<VectorStore>;

  retrieveVectorStore?(id: string): Promise<VectorStore>;

  // Cleanup methods
  deleteFile?(fileId: string): Promise<void>;
  deleteVectorStore?(vectorStoreId: string): Promise<void>;
}

// Error types for consistent error handling
export class LLMError extends Error {
  constructor(
    message: string,
    public provider: LLMProvider,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "LLMError";
  }
}

export class AuthenticationError extends LLMError {}
export class RateLimitError extends LLMError {}
export class InvalidRequestError extends LLMError {}

// File Processing specific errors
export type FileProcessingErrorCode =
  | "UPLOAD_FAILED"
  | "PROCESSING_FAILED"
  | "INVALID_FILE_TYPE"
  | "FILE_TOO_LARGE"
  | "EXTRACTION_FAILED";

export class FileProcessingError extends Error {
  constructor(
    message: string,
    public code: FileProcessingErrorCode
  ) {
    super(message);
    this.name = "FileProcessingError";
  }
}
