import { PrismaClient } from "@prisma/client";
import { PlatformPost } from "../platforms/basePlatform";
import { InteractionMemory } from "../memory/pinecone";
import { v4 as uuidv4 } from "uuid";

export class AnalyticsService {
  private db: PrismaClient;
  private memory: InteractionMemory;

  constructor(db: PrismaClient, memory: InteractionMemory) {
    this.db = db;
    this.memory = memory;
  }

  async generateEngagementReport(userId: string) {
    const posts = await this.db.post.findMany({
      where: { userId },
      include: { analytics: true },
    });

    const engagementData = posts.map((post) => ({
      postId: post.id,
      platform: post.platform,
      views: post.analytics?.views || 0,
      likes: post.analytics?.likes || 0,
      comments: post.analytics?.comments || 0,
      shares: post.analytics?.shares || 0,
      engagementRate: this.calculateEngagementRate(post.analytics),
    }));

    const totalEngagement = engagementData.reduce((acc, curr) => {
      return {
        views: acc.views + curr.views,
        likes: acc.likes + curr.likes,
        comments: acc.comments + curr.comments,
        shares: acc.shares + curr.shares,
      };
    }, { views: 0, likes: 0, comments: 0, shares: 0 });

    return {
      userId,
      totalEngagement,
      posts: engagementData,
      overallEngagementRate: this.calculateOverallEngagementRate(totalEngagement),
      trendingPosts: this.getTrendingPosts(engagementData),
      engagementHalos: this.generateEngagementHalos(engagementData),
    };
  }

  private calculateEngagementRate(analytics: any) {
    if (!analytics) return 0;
    const totalInteractions = analytics.likes + analytics.comments + analytics.shares;
    return (totalInteractions / analytics.views) * 100 || 0;
  }

  private calculateOverallEngagementRate(totalEngagement: any) {
    const totalInteractions = totalEngagement.likes + totalEngagement.comments + totalEngagement.shares;
    return (totalInteractions / totalEngagement.views) * 100 || 0;
  }

  private getTrendingPosts(posts: any[]) {
    return posts
      .sort((a, b) => b.engagementRate - a.engagementRate)
      .slice(0, 5);
  }

  private generateEngagementHalos(posts: any[]) {
    return posts.map((post) => ({
      postId: post.postId,
      haloStrength: Math.min(100, post.engagementRate * 2), // Max 100% strength
      platform: post.platform,
      timestamp: new Date(),
    }));
  }

  async getInteractionHistory(postId: string) {
    return this.memory.getRelevantInteractions(postId, "", 10);
  }

  async trackConversion(postId: string, userId: string, value: number) {
    await this.db.analytics.update({
      where: { postId },
      data: {
        conversions: {
          increment: 1,
        },
        conversionValue: {
          increment: value,
        },
      },
    });

    await this.memory.addInteraction(postId, userId, `Conversion worth $${value}`, "conversion");
  }
}
