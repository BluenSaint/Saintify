import { BasePlatform } from "./basePlatform";
import { Threads } from "threads-api";
import { v4 as uuidv4 } from "uuid";

export class ThreadsPlatform extends BasePlatform {
  private threads: Threads;

  constructor(db: PrismaClient, memory: InteractionMemory, config: PlatformConfig) {
    super(db, memory, config);
    this.threads = new Threads({
      username: config.clientId,
      password: config.clientSecret,
    });
  }

  async authenticate(): Promise<string> {
    await this.threads.login();
    return "Threads Authenticated";
  }

  async publish(content: string): Promise<PlatformPost> {
    const postId = this.generatePostId();
    const post = await this.threads.publishPost({
      text: content,
      media: "https://placeholder.com/1080x1080", // TODO: Implement image generation
    });

    await this.db.post.create({
      data: {
        id: postId,
        content,
        platform: "THREADS",
        status: "PUBLISHED",
        userId: "TODO: Get from context",
      },
    });

    return {
      id: postId,
      content,
      platform: "THREADS",
      postId: post.id,
      timestamp: new Date(),
      metadata: {
        threadId: post.threadId,
        mediaId: post.mediaId,
      },
    };
  }

  async getInteractions(postId: string): Promise<any[]> {
    const interactions = await this.threads.getThreadLikes(postId);
    return interactions.map((i) => ({
      type: "like",
      userId: i.id,
      username: i.username,
      timestamp: new Date(i.timestamp),
    }));
  }

  async checkHealth(): Promise<boolean> {
    try {
      await this.threads.getUserProfile();
      return true;
    } catch (error) {
      return false;
    }
  }

  async getComments(postId: string): Promise<any[]> {
    const comments = await this.threads.getThreadComments(postId);
    return comments.map((c) => ({
      type: "comment",
      userId: c.author.id,
      username: c.author.username,
      content: c.text,
      timestamp: new Date(c.timestamp),
    }));
  }
}
