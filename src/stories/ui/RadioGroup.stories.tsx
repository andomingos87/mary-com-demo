import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const meta = {
  title: "UI/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  args: {
    defaultValue: "investor",
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <RadioGroup {...args} className="gap-3">
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="investor" value="investor" />
        <Label htmlFor="investor">Investidor</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="advisor" value="advisor" />
        <Label htmlFor="advisor">Advisor</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="asset" value="asset" />
        <Label htmlFor="asset">Asset</Label>
      </div>
    </RadioGroup>
  ),
};
