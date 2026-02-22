import { useUser } from "@stackframe/react";
import { useLocation } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Zap, Crown, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createCheckoutSession, getSubscription } from "@/lib/stripe";
import { useToast } from "@/hooks/use-toast";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    description: "Perfect for trying out ShiftSage",
    icon: Zap,
    features: [
      "Up to 5 staff members",
      "Basic scheduling",
      "7-day demand forecasts",
      "Email support",
    ],
    limitations: [
      "Limited AI recommendations",
      "No advanced analytics",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "Best for growing restaurants",
    icon: Crown,
    popular: true,
    features: [
      "Unlimited staff members",
      "Smart AI scheduling",
      "30-day demand forecasts",
      "Advanced analytics",
      "Priority support",
      "Real-time notifications",
      "Custom schedule templates",
    ],
    limitations: [],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$99",
    period: "/month",
    description: "For multi-location businesses",
    icon: Building,
    features: [
      "Everything in Pro",
      "Multi-location support",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "Training sessions",
    ],
    limitations: [],
  },
];

export default function Pricing() {
  const user = useUser();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const { data: subscription } = useQuery({
    queryKey: ["/api/stripe/subscription", user?.id],
    queryFn: () => user?.id ? getSubscription(user.id) : Promise.resolve({ plan: "free", status: "inactive" }),
    enabled: !!user?.id,
  });

  const currentPlan = subscription?.plan || "free";

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (planId === "free") {
      toast({ title: "You're already on the free plan" });
      return;
    }

    if (planId === currentPlan) {
      toast({ title: "You're already subscribed to this plan" });
      return;
    }

    setLoading(planId);

    try {
      const { url } = await createCheckoutSession(
        user.id,
        user.primaryEmail || "",
        planId as "pro" | "enterprise"
      );

      if (url) {
        const parsed = new URL(url);
        if (parsed.hostname === "checkout.stripe.com" || parsed.hostname === "billing.stripe.com") {
          window.location.href = url;
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4" data-testid="page-pricing">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Optimize your restaurant staffing with AI-powered scheduling. 
          Start free and upgrade when you're ready.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentPlan === plan.id;
          const isPopular = plan.popular;

          return (
            <Card 
              key={plan.id} 
              className={`relative ${isPopular ? "border-primary shadow-lg" : ""} ${isCurrentPlan ? "ring-2 ring-green-500" : ""}`}
              data-testid={`card-plan-${plan.id}`}
            >
              {isPopular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" data-testid="badge-popular">
                  Most Popular
                </Badge>
              )}
              {isCurrentPlan && (
                <Badge variant="secondary" className="absolute -top-3 right-4" data-testid="badge-current">
                  Current Plan
                </Badge>
              )}
              
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>

                <ul className="space-y-3 text-left">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <span className="h-5 w-5 shrink-0 mt-0.5 text-center">-</span>
                      <span className="text-sm">{limitation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={isPopular ? "default" : "outline"}
                  disabled={isCurrentPlan || loading === plan.id}
                  onClick={() => handleSubscribe(plan.id)}
                  data-testid={`button-subscribe-${plan.id}`}
                >
                  {loading === plan.id
                    ? "Loading..."
                    : isCurrentPlan
                    ? "Current Plan"
                    : plan.id === "free"
                    ? "Get Started"
                    : "Subscribe"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="text-center mt-12 text-sm text-muted-foreground">
        <p>All plans include a 14-day free trial. Cancel anytime.</p>
        <p className="mt-2">
          Questions? Contact us at{" "}
          <a href="mailto:support@shiftsage.com" className="text-primary hover:underline">
            support@shiftsage.com
          </a>
        </p>
      </div>
    </div>
  );
}
