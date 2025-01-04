import OpenAI from "openai";
import {
  LLMProviderInterface,
  Message,
  ModelConfig,
  LLMResponse,
  ProviderConfig,
  LLMError,
  AuthenticationError,
  RateLimitError,
  FileUploadResponse,
  VectorStore,
  StreamingLLMResponse,
} from "../types";

export class OpenAIProvider implements LLMProviderInterface {
  private client: OpenAI;

  constructor(config: ProviderConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      //organization: config.organizationId,
      dangerouslyAllowBrowser: false,
    });
  }

  private handleError(error: any): never {
    if (error instanceof OpenAI.APIError) {
      switch (error.status) {
        case 401:
          throw new AuthenticationError(error.message, "openai", error.status);
        case 429:
          throw new RateLimitError(error.message, "openai", error.status);
        default:
          throw new LLMError(error.message, "openai", error.status);
      }
    }
    throw new LLMError(error.message || "Unknown error", "openai");
  }

  async generateCompletion(
    messages: Message[],
    modelConfig: ModelConfig
  ): Promise<LLMResponse> {
    try {
      const completion = await this.client.chat.completions.create({
        model: modelConfig.modelId,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: modelConfig.temperature ?? 0.7,
        max_tokens: modelConfig.maxTokens,
      });

      return {
        content: completion.choices[0].message.content || "",
        usage: completion.usage
          ? {
              inputTokens: completion.usage.prompt_tokens,
              outputTokens: completion.usage.completion_tokens,
              totalTokens: completion.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async generateStream(
    messages: Message[],
    modelConfig: ModelConfig
  ): Promise<StreamingLLMResponse> {
    try {
      const stream = await this.client.chat.completions.create({
        model: modelConfig.modelId,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: modelConfig.temperature ?? 0.7,
        max_tokens: modelConfig.maxTokens,
        stream: true,
      });

      return {
        stream: {
          async *[Symbol.asyncIterator]() {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content;
              if (content) yield content;
            }
          },
        },
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async uploadFile(file: {
    data: Uint8Array;
    name: string;
    type: string;
  }): Promise<FileUploadResponse> {
    try {
      const blob = new Blob([file.data], { type: file.type });
      const fileObject = new File([blob], file.name, { type: file.type });

      const uploadedFile = await this.client.files.create({
        file: fileObject,
        purpose: "assistants",
      });

      return {
        id: uploadedFile.id,
        size: fileObject.size,
        type: fileObject.type,
        name: fileObject.name,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async createVectorStore(
    file_ids: string[],
    options?: { expiresInDays?: number }
  ): Promise<VectorStore> {
    try {
      const vectorStore = await this.client.beta.vectorStores.create({
        name: `store-${Date.now()}`,
        file_ids: file_ids,
        expires_after: options?.expiresInDays
          ? {
              anchor: "last_active_at",
              days: options.expiresInDays,
            }
          : undefined,
      });

      return {
        id: vectorStore.id,
        status: {
          inProgress: vectorStore.file_counts.in_progress,
          completed: vectorStore.file_counts.completed,
          failed: vectorStore.file_counts.failed,
        },
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async retrieveVectorStore(id: string): Promise<VectorStore> {
    try {
      const vectorStore = await this.client.beta.vectorStores.retrieve(id);

      return {
        id: vectorStore.id,
        status: {
          inProgress: vectorStore.file_counts.in_progress,
          completed: vectorStore.file_counts.completed,
          failed: vectorStore.file_counts.failed,
        },
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.client.files.del(fileId);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteVectorStore(vectorStoreId: string): Promise<void> {
    try {
      await this.client.beta.vectorStores.del(vectorStoreId);
    } catch (error) {
      this.handleError(error);
    }
  }
}
