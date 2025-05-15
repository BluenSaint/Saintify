import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

export class ReferralSystem {
  private db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  async generateReferralCode(userId: string): Promise<string> {
    const code = uuidv4().replace(/-/g, "").substring(0, 8);
    await this.db.referralCode.create({
      data: {
        code,
        userId,
        createdAt: new Date(),
      },
    });
    return code;
  }

  async trackReferral(referrerCode: string, referredUserId: string): Promise<boolean> {
    const referrer = await this.db.referralCode.findUnique({
      where: { code: referrerCode },
    });

    if (!referrer) {
      return false;
    }

    await this.db.referral.create({
      data: {
        referrerId: referrer.userId,
        referredUserId,
        code: referrerCode,
        createdAt: new Date(),
      },
    });

    // Award referral bonus
    await this.db.user.update({
      where: { id: referrer.userId },
      data: { karmaCredits: { increment: 50 } },
    });

    return true;
  }

  async getReferralStats(userId: string) {
    const referrals = await this.db.referral.findMany({
      where: { referrerId: userId },
      include: {
        referredUser: true,
      },
    });

    const stats = {
      totalReferrals: referrals.length,
      activeReferrals: referrals.filter(
        (r) => r.referredUser?.karmaCredits > 0
      ).length,
      totalCreditsEarned: referrals.length * 50,
      lastReferral: referrals[0]?.createdAt,
    };

    return stats;
  }

  async getReferralLink(userId: string): Promise<string> {
    const code = await this.db.referralCode.findFirst({
      where: { userId },
    });

    if (!code) {
      return "";
    }

    return `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${code.code}`;
  }
}
