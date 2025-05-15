import { PineconeClient } from "@pinecone-database/pinecone";
import { v7 as uuidv7 } from "uuid";

export class PineconeService {
  private client: PineconeClient;
  private index: any;

  constructor(private readonly config: {
    apiKey: string;
    environment: string;
    indexName: string;
  }) {
    this.client = new PineconeClient();
  }

  async initialize(): Promise<void> {
    await this.client.init({
      apiKey: this.config.apiKey,
      environment: this.config.environment,
    });
    this.index = this.client.Index(this.config.indexName);
  }

  async addInteraction(
    postId: string,
    userId: string,
    content: string,
    platform: string
  ): Promise<void> {
    const interactionId = uuidv7();
    const vector = await this.generateVector(content);

    await this.index.upsert({
      vectors: [
        {
          id: interactionId,
          values: vector,
          metadata: {
            postId,
            userId,
            content,
            platform,
            timestamp: new Date().toISOString(),
          },
        },
      ],
    });
  }

  async getInteractions(postId: string): Promise<any[]> {
    const queryResponse = await this.index.query({
      queries: [
        {
          filter: {
            postId: { $eq: postId },
          },
        },
      ],
    });

    return queryResponse.results[0].matches;
  }

  private async generateVector(text: string): Promise<number[]> {
    // TODO: Implement vector generation using OpenAI or similar service
    return Array(1536).fill(Math.random());
  }
}
