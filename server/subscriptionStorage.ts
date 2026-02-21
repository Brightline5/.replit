import pg from "pg";
const { Pool } = pg;
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { subscriptions as subscriptionsTable, type Subscription, type InsertSubscription } from "../shared/schema";

class SubscriptionStorage {
  private pool: InstanceType<typeof Pool> | null = null;
  private db: ReturnType<typeof drizzle> | null = null;
  private memoryStore: Map<string, Subscription> = new Map();

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      this.pool = new Pool({ connectionString: databaseUrl });
      this.db = drizzle(this.pool);
    }
  }

  private useDb(): boolean {
    return !!this.db;
  }

  async getByUserId(userId: string): Promise<Subscription | undefined> {
    if (this.useDb() && this.db) {
      const rows = await this.db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, userId));
      return (rows[0] as unknown as Subscription) || undefined;
    }
    return Array.from(this.memoryStore.values()).find(s => s.userId === userId);
  }

  async getByStripeCustomerId(stripeCustomerId: string): Promise<Subscription | undefined> {
    if (this.useDb() && this.db) {
      const rows = await this.db.select().from(subscriptionsTable).where(eq(subscriptionsTable.stripeCustomerId, stripeCustomerId));
      return (rows[0] as unknown as Subscription) || undefined;
    }
    return Array.from(this.memoryStore.values()).find(s => s.stripeCustomerId === stripeCustomerId);
  }

  async create(data: InsertSubscription): Promise<Subscription> {
    if (this.useDb() && this.db) {
      const result = await this.db.insert(subscriptionsTable).values({
        userId: data.userId,
        stripeCustomerId: data.stripeCustomerId ?? null,
        stripeSubscriptionId: data.stripeSubscriptionId ?? null,
        stripePriceId: data.stripePriceId ?? null,
        status: data.status ?? "inactive",
        plan: data.plan ?? "free",
        currentPeriodStart: data.currentPeriodStart ?? null,
        currentPeriodEnd: data.currentPeriodEnd ?? null,
      }).returning();
      return result[0] as Subscription;
    }

    const id = crypto.randomUUID();
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
    this.memoryStore.set(id, subscription);
    return subscription;
  }

  async update(id: string, updates: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    if (this.useDb() && this.db) {
      await this.db.update(subscriptionsTable).set({
        ...updates,
        updatedAt: new Date(),
      } as any).where(eq(subscriptionsTable.id, id));
      const rows = await this.db.select().from(subscriptionsTable).where(eq(subscriptionsTable.id, id));
      return (rows[0] as unknown as Subscription) || undefined;
    }

    const subscription = this.memoryStore.get(id);
    if (!subscription) return undefined;
    const updated: Subscription = { ...subscription, ...updates, updatedAt: new Date() } as Subscription;
    this.memoryStore.set(id, updated);
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
