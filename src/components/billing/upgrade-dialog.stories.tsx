import type { Meta, StoryObj } from "@storybook/nextjs";
import { UpgradeDialog } from "@/components/billing/upgrade-dialog";

const plans = [
  { id: "starter", name: "Starter", price: 0 },
  { id: "creator", name: "Creator", price: 29, period: "month" },
  { id: "pro", name: "Pro", price: 79, period: "month" },
  { id: "enterprise", name: "Enterprise", price: 199, period: "month" },
];

const meta = {
  title: "Billing/UpgradeDialog",
  component: UpgradeDialog,
  args: {
    subscriptionId: "sub_demo_123",
    currentProductId: "creator",
    plans,
  },
  decorators: [
    (Story) => (
      <div className="bg-background p-6 max-w-lg">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UpgradeDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OnStarterPlan: Story = {
  args: {
    currentProductId: "starter",
    plans,
  },
};

export const OnEnterprisePlan: Story = {
  args: {
    currentProductId: "enterprise",
    plans,
  },
};
