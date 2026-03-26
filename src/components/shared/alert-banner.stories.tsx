import type { Meta, StoryObj } from "@storybook/nextjs";
import { AlertBanner } from "@/components/shared/alert-banner";

const meta = {
  title: "Shared/AlertBanner",
  component: AlertBanner,
  decorators: [
    (Story) => (
      <div className="p-6 max-w-lg">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AlertBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { events: [] },
};

export const OpenDispute: Story = {
  args: {
    events: [
      {
        id: "evt_1",
        event_type: "dispute",
        status: "open",
        created_at: new Date().toISOString(),
      },
    ],
  },
};

export const RefundProcessed: Story = {
  args: {
    events: [
      {
        id: "evt_2",
        event_type: "refund",
        created_at: new Date().toISOString(),
      },
    ],
  },
};

export const MixedAlerts: Story = {
  args: {
    events: [
      {
        id: "evt_1",
        event_type: "dispute",
        status: "open",
        created_at: new Date().toISOString(),
      },
      {
        id: "evt_2",
        event_type: "refund",
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  },
};

export const IgnoredEventTypes: Story = {
  args: {
    events: [
      { id: "evt_3", event_type: "charge.succeeded", created_at: new Date().toISOString() },
      { id: "evt_4", event_type: "subscription.updated", created_at: new Date().toISOString() },
    ],
  },
};
