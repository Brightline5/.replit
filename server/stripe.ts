import Stripe from "stripe";
import { Router, raw } from "express";
import { subscriptionStorage } from "./subscriptionStorage.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-12-15.clover",
});

export const stripeRouter = Router();

const PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PRICE_ID || "price_pro_monthly",
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || "price_enterprise_monthly",
};

stripeRouter.post("/create-checkout-session", async (req, res) => {
  try {
    const { userId, userEmail, plan } = req.body;

    if (!userId || !userEmail || !plan) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!PRICE_IDS[plan as keyof typeof PRICE_IDS]) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    let customer;
    const existingSub = await subscriptionStorage.getByUserId(userId);
    
    if (existingSub?.stripeCustomerId) {
      try {
        const retrieved = await stripe.customers.retrieve(existingSub.stripeCustomerId);
        if (retrieved.deleted) {
          customer = await stripe.customers.create({
            email: userEmail,
            metadata: { stackUserId: userId },
          });
        } else {
          customer = retrieved;
        }
      } catch {
        customer = await stripe.customers.create({
          email: userEmail,
          metadata: { stackUserId: userId },
        });
      }
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: { stackUserId: userId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      client_reference_id: userId,
      line_items: [
        {
          price: PRICE_IDS[plan as keyof typeof PRICE_IDS],
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.origin || process.env.APP_URL}/dashboard?payment=success`,
      cancel_url: `${req.headers.origin || process.env.APP_URL}/pricing?payment=canceled`,
      metadata: {
        stackUserId: userId,
        plan,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

stripeRouter.post("/create-portal-session", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const subscription = await subscriptionStorage.getByUserId(userId);
    
    if (!subscription?.stripeCustomerId) {
      return res.status(404).json({ error: "No subscription found" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${req.headers.origin || process.env.APP_URL}/settings`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe portal error:", error);
    res.status(500).json({ error: "Failed to create portal session" });
  }
});

stripeRouter.get("/subscription/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId || userId === "undefined" || userId === "null") {
      return res.json({ plan: "free", status: "inactive" });
    }
    
    const subscription = await subscriptionStorage.getByUserId(userId);
    
    if (!subscription) {
      return res.json({ plan: "free", status: "inactive" });
    }

    res.json(subscription);
  } catch (error: any) {
    console.error("Get subscription error:", error);
    res.status(500).json({ error: "Failed to get subscription" });
  }
});

stripeRouter.post(
  "/webhook",
  raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      return res.status(400).json({ error: "Missing signature or webhook secret" });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.stackUserId || session.client_reference_id;
        const plan = session.metadata?.plan || "pro";

        if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          
          const subData = subscription as any;
          await subscriptionStorage.upsert({
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subData.id,
            stripePriceId: subData.items?.data?.[0]?.price?.id,
            status: "active",
            plan,
            currentPeriodStart: subData.current_period_start ? new Date(subData.current_period_start * 1000) : null,
            currentPeriodEnd: subData.current_period_end ? new Date(subData.current_period_end * 1000) : null,
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const stripeSub = event.data.object as any;
        const customerId = stripeSub.customer as string;
        
        const existingSub = await subscriptionStorage.getByStripeCustomerId(customerId);
        if (existingSub) {
          await subscriptionStorage.update(existingSub.id, {
            status: stripeSub.status === "active" ? "active" : "inactive",
            currentPeriodStart: stripeSub.current_period_start ? new Date(stripeSub.current_period_start * 1000) : null,
            currentPeriodEnd: stripeSub.current_period_end ? new Date(stripeSub.current_period_end * 1000) : null,
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const deletedSub = event.data.object as any;
        const customerId = deletedSub.customer as string;
        
        const existingSub = await subscriptionStorage.getByStripeCustomerId(customerId);
        if (existingSub) {
          await subscriptionStorage.update(existingSub.id, {
            status: "canceled",
            plan: "free",
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        const existingSub = await subscriptionStorage.getByStripeCustomerId(customerId);
        if (existingSub) {
          await subscriptionStorage.update(existingSub.id, {
            status: "past_due",
          });
        }
        break;
      }
    }

    res.json({ received: true });
  }
);

export default stripeRouter;
