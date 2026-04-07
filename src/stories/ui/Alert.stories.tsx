import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const meta = {
  title: "UI/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Alert className="w-[520px]">
      <CheckCircle2 className="h-4 w-4" />
      <AlertTitle>Configuração salva</AlertTitle>
      <AlertDescription>
        Os dados foram atualizados com sucesso.
      </AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive" className="w-[520px]">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Falha na validação</AlertTitle>
      <AlertDescription>
        Revise os campos obrigatórios antes de continuar.
      </AlertDescription>
    </Alert>
  ),
};
