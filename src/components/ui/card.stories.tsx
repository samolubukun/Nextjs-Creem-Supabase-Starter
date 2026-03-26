import type { Meta, StoryObj } from "@storybook/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const meta = {
  title: "UI/Card",
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[420px]">
      <CardHeader>
        <CardTitle>Command Capsule</CardTitle>
        <CardDescription>System status and controls in a focused container.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">All services operational.</p>
      </CardContent>
      <CardFooter>
        <Button>Open Panel</Button>
      </CardFooter>
    </Card>
  ),
};
