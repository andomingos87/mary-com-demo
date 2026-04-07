import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const meta = {
  title: "UI/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-72">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Selecione um setor" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Setores</SelectLabel>
            <SelectItem value="fintech">Fintech</SelectItem>
            <SelectItem value="healthtech">Healthtech</SelectItem>
            <SelectItem value="retail">Retail</SelectItem>
            <SelectItem value="saas">SaaS B2B</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
};
