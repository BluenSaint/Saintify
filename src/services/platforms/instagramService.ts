import { PlatformPost } from "@/lib/platforms/basePlatform";
import { Instagram } from "instagram-web-api";

export class InstagramService {
  private client: Instagram;

  constructor(private readonly config: {
    username: string;
    password: string;
  }) {
    this.client = new Instagram({
      username: config.username,
      password: config.password,
    });
  }

  async authenticate(): Promise<void> {
    await this.client.login();
  }

  async publish(content: string): Promise<PlatformPost> {
    const post = await this.client.publishPhoto({
      caption: content,
      image: "https://placeholder.com/1080x1080",
    });

    return {
      id: post.id,
      content,
      platform: "instagram",
      postId: post.id,
      timestamp: new Date(),
      metadata: {
        likes: 0,
        comments: 0,
        shares: 0,
      },
    };
  }

  async getInteractions(postId: string): Promise<any[]> {
    return await this.client.getMediaLikes(postId);
  }
}
