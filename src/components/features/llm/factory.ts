import {
  LLMProvider,
  LLMProviderInterface,
  ProviderConfig,
  ModelConfig,
  Message,
  LLMResponse,
  StreamingLLMResponse,
} from "./types";
import { OpenAIProvider } from "./providers/openai";

export class LLMFactory {
  private static providers: Map<LLMProvider, LLMProviderInterface> = new Map();

  static initialize(configs: Record<LLMProvider, ProviderConfig>) {
    // Initialize providers with their configs
    if (configs.openai) {
      this.providers.set("openai", new OpenAIProvider(configs.openai));
    }
    // Add other providers here as they're implemented
    // if (configs.anthropic) {
    //   this.providers.set('anthropic', new AnthropicProvider(configs.anthropic));
    // }
  }

  static getProvider(provider: LLMProvider): LLMProviderInterface {
    const implementation = this.providers.get(provider);
    if (!implementation) {
      throw new Error(`Provider ${provider} not initialized`);
    }
    return implementation;
  }

  static async generateCompletion(
    messages: Message[],
    modelConfig: ModelConfig
  ): Promise<LLMResponse> {
    const provider = this.getProvider(modelConfig.provider);
    return await provider.generateCompletion(messages, modelConfig);
  }

  static async generateStream(
    messages: Message[],
    modelConfig: ModelConfig
  ): Promise<StreamingLLMResponse> {
    const provider = this.getProvider(modelConfig.provider);
    return await provider.generateStream(messages, modelConfig);
  }
}
