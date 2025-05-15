import { PrismaClient } from "@prisma/client";
import { InteractionMemory } from "../memory/pinecone";
import { v7 as uuidv7 } from "uuid";

export interface PlatformConfig {
  name: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface PlatformPost {
  id: string;
  content: string;
  platform: string;
  postId: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export abstract class BasePlatform {
  protected db: PrismaClient;
  protected memory: InteractionMemory;
  protected config: PlatformConfig;

  constructor(db: PrismaClient, memory: InteractionMemory, config: PlatformConfig) {
    this.db = db;
    this.memory = memory;
    this.config = config;
  }

  abstract authenticate(): Promise<string>;
  abstract publish(post: string): Promise<PlatformPost>;
  abstract getInteractions(postId: string): Promise<any[]>;
  abstract checkHealth(): Promise<boolean>;

  protected generatePostId(): string {
    return uuidv7();
  }

  protected async trackInteraction(
    postId: string,
    userId: string,
    content: string,
    type: string
  ) {
    await this.memory.addInteraction(postId, userId, content, this.config.name);
  }

  protected async updateAnalytics(post: PlatformPost) {
    const analytics = await this.getInteractions(post.postId);
    
    await this.db.analytics.upsert({
      where: { postId: post.id },
      update: {
        views: analytics.length,
        likes: analytics.filter((i) => i.type === "like").length,
        comments: analytics.filter((i) => i.type === "comment").length,
        shares: analytics.filter((i) => i.type === "share").length,
      },
      create: {
        postId: post.id,
        views: analytics.length,
        likes: analytics.filter((i) => i.type === "like").length,
        comments: analytics.filter((i) => i.type === "comment").length,
        shares: analytics.filter((i) => i.type === "share").length,
      },
    });
  }
}
