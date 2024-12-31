// services/fileProcessing.ts
import {
  LLMProvider,
  LLMProviderInterface,
  FileUploadResponse,
  VectorStore,
  LLMError,
} from "../types";
import { LLMFactory } from "../factory";

export class FileProcessingError extends Error {
  constructor(
    message: string,
    public code:
      | "UPLOAD_FAILED"
      | "PROCESSING_FAILED"
      | "INVALID_FILE_TYPE"
      | "FILE_TOO_LARGE"
  ) {
    super(message);
    this.name = "FileProcessingError";
  }
}

interface FileProcessingOptions {
  maxFileSizeBytes?: number;
  validFileTypes?: string[];
  vectorStoreExpiryDays?: number;
}

export class FileProcessingService {
  private provider: LLMProviderInterface;
  private options: Required<FileProcessingOptions>;

  constructor(provider: LLMProvider, options: FileProcessingOptions = {}) {
    this.provider = LLMFactory.getProvider(provider);
    this.options = {
      maxFileSizeBytes: options.maxFileSizeBytes || 10 * 1024 * 1024, // 10MB default
      validFileTypes: options.validFileTypes || [
        "application/pdf",
        "text/plain",
        "application/msword",
      ],
      vectorStoreExpiryDays: options.vectorStoreExpiryDays || 1,
    };

    // Verify provider supports file operations
    if (!this.provider.uploadFile || !this.provider.createVectorStore) {
      throw new Error(`Provider ${provider} does not support file operations`);
    }
  }

  private validateFile(file: { data: Uint8Array; type: string }) {
    if (!this.options.validFileTypes.includes(file.type)) {
      throw new FileProcessingError(
        `Invalid file type. Supported types: ${this.options.validFileTypes.join(", ")}`,
        "INVALID_FILE_TYPE"
      );
    }

    if (file.data.length > this.options.maxFileSizeBytes) {
      throw new FileProcessingError(
        `File too large. Maximum size: ${this.options.maxFileSizeBytes / (1024 * 1024)}MB`,
        "FILE_TOO_LARGE"
      );
    }
  }

  async processFile(file: {
    data: Uint8Array;
    name: string;
    type: string;
  }): Promise<{ fileId: string; vectorStoreId: string }> {
    this.validateFile(file);

    let uploadedFile: FileUploadResponse | undefined;
    let vectorStore: VectorStore | undefined;

    try {
      // Upload file
      uploadedFile = await this.provider.uploadFile!(file);
      console.log("File uploaded successfully:", uploadedFile.id);

      // Create vector store
      vectorStore = await this.provider.createVectorStore!([uploadedFile.id], {
        expiresInDays: this.options.vectorStoreExpiryDays,
      });
      console.log("Vector store created:", vectorStore.id);

      // Wait for processing to complete
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        const status = await this.provider.retrieveVectorStore!(vectorStore.id);
        console.log("Processing status:", status.status);

        if (status.status.inProgress === 0 && status.status.completed > 0) {
          return {
            fileId: uploadedFile.id,
            vectorStoreId: vectorStore.id,
          };
        }

        if (status.status.failed > 0) {
          throw new FileProcessingError(
            "File processing failed in vector store",
            "PROCESSING_FAILED"
          );
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;
      }

      throw new FileProcessingError(
        "Timeout waiting for file processing",
        "PROCESSING_FAILED"
      );
    } catch (error) {
      // Cleanup on error
      if (vectorStore?.id) {
        await this.provider
          .deleteVectorStore?.(vectorStore.id)
          .catch((e) => console.error("Error cleaning up vector store:", e));
      }
      if (uploadedFile?.id) {
        await this.provider
          .deleteFile?.(uploadedFile.id)
          .catch((e) => console.error("Error cleaning up file:", e));
      }

      if (error instanceof FileProcessingError || error instanceof LLMError) {
        throw error;
      }
      throw new FileProcessingError(
        `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
        "PROCESSING_FAILED"
      );
    }
  }

  async cleanup(fileId: string, vectorStoreId: string): Promise<void> {
    try {
      await Promise.all([
        this.provider.deleteVectorStore?.(vectorStoreId),
        this.provider.deleteFile?.(fileId),
      ]);
    } catch (error) {
      console.error("Error during cleanup:", error);
      // Don't throw here to avoid masking original errors
    }
  }
}
