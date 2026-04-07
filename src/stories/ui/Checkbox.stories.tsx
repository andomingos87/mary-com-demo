import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Aceito os termos de uso</Label>
    </div>
  ),
};

export const Checked: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="privacy" defaultChecked />
      <Label htmlFor="privacy">Aceito a política de privacidade</Label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-1" disabled />
        <Label htmlFor="disabled-1">Desabilitado</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-2" defaultChecked disabled />
        <Label htmlFor="disabled-2">Marcado e desabilitado</Label>
      </div>
    </div>
  ),
};
