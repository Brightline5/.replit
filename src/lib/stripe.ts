import { loadStripe } from "@stripe/stripe-js";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";

export const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export async function createCheckoutSession(userId: string, userEmail: string, plan: "pro" | "enterprise") {
  const response = await fetch("/api/stripe/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, userEmail, plan }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create checkout session");
  }

  return response.json();
}

export async function createPortalSession(userId: string) {
  const response = await fetch("/api/stripe/create-portal-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create portal session");
  }

  return response.json();
}

export async function getSubscription(userId: string) {
  const response = await fetch(`/api/stripe/subscription/${userId}`);
  
  if (!response.ok) {
    throw new Error("Failed to get subscription");
  }

  return response.json();
}
