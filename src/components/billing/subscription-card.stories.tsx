import type { Meta, StoryObj } from "@storybook/nextjs";
import { SubscriptionCard } from "@/components/billing/subscription-card";

const meta = {
  title: "Billing/SubscriptionCard",
  component: SubscriptionCard,
} satisfies Meta<typeof SubscriptionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoSubscription: Story = {
  args: {
    subscription: null,
  },
};

export const ActiveSubscription: Story = {
  args: {
    subscription: {
      status: "active",
      product_name: "Creator",
      current_period_end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      creem_customer_id: "cus_demo_123",
    },
  },
};

export const PausedSubscription: Story = {
  args: {
    subscription: {
      status: "paused",
      product_name: "Starter",
      current_period_end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
      creem_customer_id: "cus_demo_456",
    },
  },
};
