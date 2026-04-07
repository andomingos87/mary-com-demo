import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const meta = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    placeholder: "Digite aqui...",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[360px] space-y-2">
      <Label htmlFor="input-default">Nome do projeto</Label>
      <Input id="input-default" {...args} />
    </div>
  ),
};

export const WithError: Story = {
  render: (args) => (
    <div className="w-[360px] space-y-2">
      <Label htmlFor="input-error">Email</Label>
      <Input id="input-error" error {...args} placeholder="email@empresa.com" />
      <p className="text-xs text-destructive">Formato de email inválido.</p>
    </div>
  ),
};
