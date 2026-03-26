import type { Meta, StoryObj } from "@storybook/nextjs";
import type { PricingPlan } from "@/components/billing/pricing-card";
import { PricingCard } from "@/components/billing/pricing-card";

const starterPlan: PricingPlan = {
  name: "Starter",
  price: "$0",
  period: "month",
  description: "For individuals exploring the platform with basic features.",
  productId: "prod_starter",
  features: [
    "3 AI queries per day",
    "Basic chat access",
    "Community support",
    "Standard response times",
  ],
};

const creatorPlan: PricingPlan = {
  name: "Creator",
  price: "$29",
  period: "month",
  description: "For creators who need more power and priority access.",
  productId: "prod_creator",
  popular: true,
  features: [
    "100 AI queries per day",
    "Priority chat access",
    "Email support",
    "Faster response times",
    "Advanced features",
    "Usage analytics",
  ],
};

const proPlan: PricingPlan = {
  name: "Pro",
  price: "$79",
  period: "month",
  description: "For professionals who demand maximum throughput and reliability.",
  productId: "prod_pro",
  features: [
    "Unlimited AI queries",
    "Priority chat access",
    "Dedicated support",
    "Fastest response times",
    "All advanced features",
    "Detailed analytics",
    "API access",
  ],
};

const meta = {
  title: "Billing/PricingCard",
  component: PricingCard,
  decorators: [
    (Story) => (
      <div className="p-6 max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;
type StoryWithArgs = StoryObj<{ plan: PricingPlan; discountCode?: string }>;

export const Starter: Story = {
  args: { plan: starterPlan },
} satisfies StoryWithArgs;

export const Creator: Story = {
  args: { plan: creatorPlan },
} satisfies StoryWithArgs;

export const Pro: Story = {
  args: { plan: proPlan },
} satisfies StoryWithArgs;

export const AllPlans: Story = {
  args: { plan: starterPlan },
  render: () => (
    <div className="flex flex-col md:flex-row gap-6 p-6 items-stretch">
      <div className="flex-1">
        <PricingCard plan={starterPlan} />
      </div>
      <div className="flex-1">
        <PricingCard plan={creatorPlan} />
      </div>
      <div className="flex-1">
        <PricingCard plan={proPlan} />
      </div>
    </div>
  ),
} satisfies StoryWithArgs;
