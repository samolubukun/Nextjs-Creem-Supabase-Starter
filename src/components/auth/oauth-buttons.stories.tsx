import type { Meta, StoryObj } from "@storybook/nextjs";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

const meta = {
  title: "Auth/OAuthButtons",
  component: OAuthButtons,
} satisfies Meta<typeof OAuthButtons>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
