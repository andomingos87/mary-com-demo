import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const meta = {
  title: "UI/Label",
  component: Label,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    children: "Nome da empresa",
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithInput: Story = {
  render: () => (
    <div className="w-[340px] space-y-2">
      <Label htmlFor="company-name">Nome da empresa</Label>
      <Input id="company-name" placeholder="Ex: Mary Capital Partners" />
    </div>
  ),
};
