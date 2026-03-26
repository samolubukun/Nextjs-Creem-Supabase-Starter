import type { Meta, StoryObj } from "@storybook/nextjs";
import { SubscriptionCard } from "@/components/billing/subscription-card";

const meta = {
  title: "Billing/SubscriptionCard",
  component: SubscriptionCard,
  decorators: [
    (Story) => (
      <div className="p-6 max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SubscriptionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoSubscription: Story = {
  args: { subscription: null },
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

export const CancelledSubscription: Story = {
  args: {
    subscription: {
      status: "cancelled",
      product_name: "Creator",
      current_period_end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
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

export const ExpiredSubscription: Story = {
  args: {
    subscription: {
      status: "expired",
      product_name: "Pro",
      current_period_end: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      creem_customer_id: "cus_demo_789",
    },
  },
};

export const NoRenewalDate: Story = {
  args: {
    subscription: {
      status: "active",
      product_name: "Nova Pro Max",
      current_period_end: "",
      creem_customer_id: "cus_demo_oneoff",
    },
  },
};
