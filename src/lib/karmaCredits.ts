export interface KarmaCredit {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  timestamp: Date;
  expiresAt?: Date;
}

export class KarmaCreditSystem {
  private credits: Map<string, number> = new Map();
  private transactions: KarmaCredit[] = [];

  constructor(private db: any) {}

  async initialize() {
    // Load credits from database
    const credits = await this.db.user.findMany({
      select: { id: true, karmaCredits: true },
    });
    credits.forEach((user) => {
      this.credits.set(user.id, user.karmaCredits);
    });
  }

  async awardCredits(userId: string, amount: number, reason: string) {
    const currentCredits = this.credits.get(userId) || 0;
    const newCredits = currentCredits + amount;

    await this.db.user.update({
      where: { id: userId },
      data: { karmaCredits: newCredits },
    });

    this.credits.set(userId, newCredits);

    const transaction: KarmaCredit = {
      id: crypto.randomUUID(),
      userId,
      amount,
      reason,
      timestamp: new Date(),
    };

    this.transactions.push(transaction);
    await this.db.karmaCredit.create({ data: transaction });

    return newCredits;
  }

  async deductCredits(userId: string, amount: number, reason: string) {
    const currentCredits = this.credits.get(userId) || 0;
    if (currentCredits < amount) {
      throw new Error("Insufficient Karma Credits");
    }

    const newCredits = currentCredits - amount;

    await this.db.user.update({
      where: { id: userId },
      data: { karmaCredits: newCredits },
    });

    this.credits.set(userId, newCredits);

    const transaction: KarmaCredit = {
      id: crypto.randomUUID(),
      userId,
      amount: -amount,
      reason,
      timestamp: new Date(),
    };

    this.transactions.push(transaction);
    await this.db.karmaCredit.create({ data: transaction });

    return newCredits;
  }

  async getCreditBalance(userId: string) {
    return this.credits.get(userId) || 0;
  }

  async getTransactions(userId: string, limit: number = 10) {
    const userTransactions = this.transactions
      .filter((t) => t.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    return userTransactions;
  }
}
