import { type Subscription, type InsertSubscription } from "../shared/schema";
import { randomUUID } from "crypto";

class SubscriptionStorage {
  private subscriptions: Map<string, Subscription> = new Map();

  async getByUserId(userId: string): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(
      (s) => s.userId === userId
    );
  }

  async getByStripeCustomerId(stripeCustomerId: string): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(
      (s) => s.stripeCustomerId === stripeCustomerId
    );
  }

  async create(data: InsertSubscription): Promise<Subscription> {
    const id = randomUUID();
    const subscription: Subscription = {
      id,
      userId: data.userId,
      stripeCustomerId: data.stripeCustomerId || null,
      stripeSubscriptionId: data.stripeSubscriptionId || null,
      stripePriceId: data.stripePriceId || null,
      status: data.status || "inactive",
      plan: data.plan || "free",
      currentPeriodStart: data.currentPeriodStart || null,
      currentPeriodEnd: data.currentPeriodEnd || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async update(id: string, updates: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return undefined;

    const updated: Subscription = {
      ...subscription,
      ...updates,
      updatedAt: new Date(),
    };
    this.subscriptions.set(id, updated);
    return updated;
  }

  async upsert(data: InsertSubscription): Promise<Subscription> {
    const existing = await this.getByUserId(data.userId);
    if (existing) {
      return (await this.update(existing.id, data)) as Subscription;
    }
    return this.create(data);
  }
}

export const subscriptionStorage = new SubscriptionStorage();
