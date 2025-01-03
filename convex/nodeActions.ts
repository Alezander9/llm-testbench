"use node"; // Enable Node.js runtime

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { webcrypto } from "crypto";

export const encryptApiKey = internalAction({
  args: {
    apiKey: v.string(),
  },
  handler: async (_ctx, args) => {
    const encryptionService = await KeyEncryptionService.create(
      process.env.MASTER_ENCRYPTION_KEY!
    );

    return await encryptionService.encrypt(args.apiKey);
  },
});

export const decryptApiKey = internalAction({
  args: {
    encryptedKey: v.string(),
  },
  handler: async (_ctx, args) => {
    const encryptionService = await KeyEncryptionService.create(
      process.env.MASTER_ENCRYPTION_KEY!
    );

    return await encryptionService.decrypt(args.encryptedKey);
  },
});

export class KeyEncryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KeyEncryptionError";
  }
}

export class KeyEncryptionService {
  private constructor(private encryptionKey: CryptoKey) {}

  /**
   * Creates and initializes a new KeyEncryptionService
   */
  public static async create(masterKey: string): Promise<KeyEncryptionService> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(masterKey);

    // Use SHA-256 to get consistent key length
    const hashBuffer = await webcrypto.subtle.digest("SHA-256", keyData);

    // Import the key for AES-GCM
    const encryptionKey = await webcrypto.subtle.importKey(
      "raw",
      hashBuffer,
      { name: "AES-GCM" },
      false, // not extractable
      ["encrypt", "decrypt"]
    );

    return new KeyEncryptionService(encryptionKey);
  }

  /**
   * Encrypts an API key
   * @param apiKey The API key to encrypt
   * @returns Promise<string> Base64 encoded encrypted data with IV
   */
  async encrypt(apiKey: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(apiKey);

      // Generate a random IV
      const iv = webcrypto.getRandomValues(new Uint8Array(12));

      const encryptedData = await webcrypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        await this.encryptionKey,
        data
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encryptedData.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedData), iv.length);

      // Convert to base64 using Buffer instead of btoa
      return Buffer.from(combined).toString("base64");
    } catch (error) {
      throw new KeyEncryptionError(
        `Failed to encrypt API key: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Decrypts an encrypted API key
   * @param encryptedKey Base64 encoded encrypted data with IV
   * @returns Promise<string> The decrypted API key
   */
  async decrypt(encryptedKey: string): Promise<string> {
    try {
      // Convert from base64 using Buffer instead of atob
      const combined = new Uint8Array(Buffer.from(encryptedKey, "base64"));

      // Extract IV and encrypted data
      const iv = combined.slice(0, 12);
      const data = combined.slice(12);

      const decryptedData = await webcrypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        await this.encryptionKey,
        data
      );

      return new TextDecoder().decode(decryptedData);
    } catch (error) {
      throw new KeyEncryptionError(
        `Failed to decrypt API key: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Validates that a key can be successfully encrypted and decrypted
   * @param apiKey The API key to validate
   * @returns Promise<boolean>
   */
  async validateEncryption(apiKey: string): Promise<boolean> {
    try {
      const encrypted = await this.encrypt(apiKey);
      const decrypted = await this.decrypt(encrypted);
      return decrypted === apiKey;
    } catch {
      return false;
    }
  }
}
