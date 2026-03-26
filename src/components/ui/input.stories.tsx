import type { Meta, StoryObj } from "@storybook/nextjs";
import { Input } from "@/components/ui/input";

const meta = {
  title: "UI/Input",
  component: Input,
  args: {
    placeholder: "you@example.com",
    type: "email",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Enter secure password",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "readonly@example.com",
  },
};
