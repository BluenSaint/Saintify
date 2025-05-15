import { BasePlatform } from "./basePlatform";
import { Instagram } from "instagram-web-api";
import { v4 as uuidv4 } from "uuid";

export class InstagramPlatform extends BasePlatform {
  private instagram: Instagram;

  constructor(db: PrismaClient, memory: InteractionMemory, config: PlatformConfig) {
    super(db, memory, config);
    this.instagram = new Instagram({
      username: config.clientId,
      password: config.clientSecret,
    });
  }

  async authenticate(): Promise<string> {
    await this.instagram.login();
    return "Instagram Authenticated";
  }

  async publish(content: string): Promise<PlatformPost> {
    const postId = this.generatePostId();
    const post = await this.instagram.publishPhoto({
      caption: content,
      image: "https://placeholder.com/1080x1080", // TODO: Implement image generation
    });

    await this.db.post.create({
      data: {
        id: postId,
        content,
        platform: "INSTAGRAM",
        status: "PUBLISHED",
        userId: "TODO: Get from context",
      },
    });

    return {
      id: postId,
      content,
      platform: "INSTAGRAM",
      postId: post.id,
      timestamp: new Date(),
      metadata: {
        mediaId: post.mediaId,
        shortcode: post.shortcode,
      },
    };
  }

  async getInteractions(postId: string): Promise<any[]> {
    const interactions = await this.instagram.getMediaLikes(postId);
    return interactions.map((i) => ({
      type: "like",
      userId: i.id,
      username: i.username,
      timestamp: new Date(i.timestamp),
    }));
  }

  async checkHealth(): Promise<boolean> {
    try {
      await this.instagram.getUserProfile();
      return true;
    } catch (error) {
      return false;
    }
  }
}
