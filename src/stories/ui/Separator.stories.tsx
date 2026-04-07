import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Separator } from "@/components/ui/separator";

const meta = {
  title: "UI/Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-[420px] space-y-3">
      <p className="text-sm text-foreground">Seção acima</p>
      <Separator />
      <p className="text-sm text-muted-foreground">Seção abaixo</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-16 items-center gap-3">
      <span className="text-sm">A</span>
      <Separator orientation="vertical" className="h-10" />
      <span className="text-sm">B</span>
    </div>
  ),
};
