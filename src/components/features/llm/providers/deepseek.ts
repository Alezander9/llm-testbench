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

export class DeepSeekProvider implements LLMProviderInterface {
  private client: OpenAI;

  constructor(config: ProviderConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: "https://api.deepseek.com",
      dangerouslyAllowBrowser: false,
    });
  }

  private handleError(error: any): never {
    if (error instanceof OpenAI.APIError) {
      switch (error.status) {
        case 401:
          throw new AuthenticationError(
            error.message,
            "deepseek",
            error.status
          );
        case 429:
          throw new RateLimitError(error.message, "deepseek", error.status);
        case 402:
          throw new LLMError("Insufficient balance", "deepseek", error.status);
        case 503:
          throw new RateLimitError(
            "Server overloaded",
            "deepseek",
            error.status
          );
        default:
          throw new LLMError(error.message, "deepseek", error.status);
      }
    }
    throw new LLMError(error.message || "Unknown error", "deepseek");
  }

  async generateCompletion(
    messages: Message[],
    modelConfig: ModelConfig
  ): Promise<LLMResponse> {
    try {
      const completion = await this.client.chat.completions.create({
        model: "deepseek-chat",
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: modelConfig.temperature ?? 1.0,
        max_tokens: modelConfig.maxTokens ?? 4096,
      });

      return {
        content: completion.choices[0].message.content || "",
        usage: completion.usage
          ? {
              promptTokens: completion.usage.prompt_tokens,
              completionTokens: completion.usage.completion_tokens,
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
        model: "deepseek-chat",
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: modelConfig.temperature ?? 1.0,
        max_tokens: modelConfig.maxTokens ?? 4096,
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

  async uploadFile(): Promise<FileUploadResponse> {
    throw new Error("File operations not supported by DeepSeek");
  }

  async createVectorStore(): Promise<VectorStore> {
    throw new Error("Vector store operations not supported by DeepSeek");
  }

  async retrieveVectorStore(): Promise<VectorStore> {
    throw new Error("Vector store operations not supported by DeepSeek");
  }

  async deleteFile(): Promise<void> {
    throw new Error("File operations not supported by DeepSeek");
  }

  async deleteVectorStore(): Promise<void> {
    throw new Error("Vector store operations not supported by DeepSeek");
  }
}
