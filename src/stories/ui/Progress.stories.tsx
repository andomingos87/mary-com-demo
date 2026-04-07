import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Progress } from "@/components/ui/progress";

const meta = {
  title: "UI/Progress",
  component: Progress,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    value: 65,
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[320px]">
      <Progress {...args} />
    </div>
  ),
};

export const Stages: Story = {
  render: () => (
    <div className="w-[320px] space-y-3">
      <Progress value={20} />
      <Progress value={45} />
      <Progress value={80} />
      <Progress value={100} />
    </div>
  ),
};
