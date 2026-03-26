import type { Meta, StoryObj } from "@storybook/nextjs";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const meta = {
  title: "UI/Button",
  component: Button,
  args: {
    children: "Initiate",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button>Primary</Button>
      <Button disabled>Processing</Button>
      <Button>
        Continue
        <ArrowRight className="size-4" />
      </Button>
    </div>
  ),
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        Continue
        <ArrowRight className="size-4" />
      </>
    ),
  },
};

export const LoadingState: Story = {
  args: {
    disabled: true,
    children: "Processing...",
  },
};
