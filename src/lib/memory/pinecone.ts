import { Pinecone } from "@pinecone-database/pinecone";
import { v4 as uuidv4 } from "uuid";

export class InteractionMemory {
  private client: Pinecone;
  private indexName: string;

  constructor(apiKey: string, indexName: string = "saintify-interactions") {
    this.client = new Pinecone({ apiKey });
    this.indexName = indexName;
  }

  async init() {
    const index = this.client.Index(this.indexName);
    await index.upsert([
      {
        id: uuidv4(),
        values: new Array(1536).fill(0), // Initialize with zeros
        metadata: {
          type: "system",
          timestamp: new Date().toISOString(),
        },
      },
    ]);
  }

  async addInteraction(
    postId: string,
    userId: string,
    content: string,
    platform: string
  ) {
    const index = this.client.Index(this.indexName);
    const embedding = await this.generateEmbedding(content);

    await index.upsert([
      {
        id: uuidv4(),
        values: embedding,
        metadata: {
          postId,
          userId,
          platform,
          content,
          timestamp: new Date().toISOString(),
        },
      },
    ]);
  }

  async getRelevantInteractions(
    postId: string,
    query: string,
    limit: number = 5
  ) {
    const index = this.client.Index(this.indexName);
    const queryEmbedding = await this.generateEmbedding(query);

    const results = await index.query({
      vector: queryEmbedding,
      filter: {
        postId: { $eq: postId },
      },
      topK: limit,
    });

    return results.matches;
  }

  private async generateEmbedding(text: string) {
    // Implementation of embedding generation
    // This would typically use an embedding model like OpenAI's text-embedding-ada-002
    return new Array(1536).fill(0); // Placeholder
  }
}
