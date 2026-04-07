import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Spinner } from "@/components/ui/spinner";

const meta = {
  title: "UI/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner size="sm" />
      <Spinner size="default" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner variant="default" />
      <Spinner variant="secondary" />
      <Spinner variant="muted" />
      <Spinner variant="destructive" />
      <div className="rounded-md bg-primary p-3">
        <Spinner variant="white" />
      </div>
    </div>
  ),
};
