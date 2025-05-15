import { BasePlatform } from "./basePlatform";
import { Twitter } from "twitter-api";
import { v4 as uuidv4 } from "uuid";

export class TwitterPlatform extends BasePlatform {
  private twitter: Twitter;

  constructor(db: PrismaClient, memory: InteractionMemory, config: PlatformConfig) {
    super(db, memory, config);
    this.twitter = new Twitter({
      apiKey: config.clientId,
      apiSecret: config.clientSecret,
      accessToken: process.env.TWITTER_ACCESS_TOKEN || "",
      accessSecret: process.env.TWITTER_ACCESS_SECRET || "",
    });
  }

  async authenticate(): Promise<string> {
    const authUrl = await this.twitter.getAuthUrl();
    return authUrl;
  }

  async publish(content: string): Promise<PlatformPost> {
    const postId = this.generatePostId();
    const tweet = await this.twitter.tweet({
      text: content,
      media: "https://placeholder.com/1080x1080", // TODO: Implement image generation
    });

    await this.db.post.create({
      data: {
        id: postId,
        content,
        platform: "TWITTER",
        status: "PUBLISHED",
        userId: "TODO: Get from context",
      },
    });

    return {
      id: postId,
      content,
      platform: "TWITTER",
      postId: tweet.id,
      timestamp: new Date(),
      metadata: {
        tweetId: tweet.tweetId,
        url: tweet.url,
      },
    };
  }

  async getInteractions(postId: string): Promise<any[]> {
    const interactions = await this.twitter.getTweetLikes(postId);
    return interactions.map((i) => ({
      type: "like",
      userId: i.id,
      username: i.username,
      timestamp: new Date(i.timestamp),
    }));
  }

  async getRetweets(postId: string): Promise<any[]> {
    const retweets = await this.twitter.getTweetRetweets(postId);
    return retweets.map((r) => ({
      type: "retweet",
      userId: r.id,
      username: r.username,
      timestamp: new Date(r.timestamp),
    }));
  }

  async checkHealth(): Promise<boolean> {
    try {
      await this.twitter.getUserProfile();
      return true;
    } catch (error) {
      return false;
    }
  }

  async getReplies(postId: string): Promise<any[]> {
    const replies = await this.twitter.getTweetReplies(postId);
    return replies.map((r) => ({
      type: "reply",
      userId: r.author.id,
      username: r.author.username,
      content: r.text,
      timestamp: new Date(r.timestamp),
    }));
  }
}
