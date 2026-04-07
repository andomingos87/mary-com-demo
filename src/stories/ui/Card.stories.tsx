import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[420px] shadow-card">
      <CardHeader>
        <div className="mb-2 flex items-center justify-between">
          <Badge variant="secondary">Projeto</Badge>
          <Badge>Ativo</Badge>
        </div>
        <CardTitle>Asset VDR</CardTitle>
        <CardDescription>
          Workspace seguro para centralizar documentos do ativo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-foreground">
          16 documentos enviados e 4 pendentes de validação.
        </p>
        <p className="text-sm text-muted-foreground">
          Atualizado por Mary AI há 2 horas.
        </p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="default">Abrir workspace</Button>
        <Button variant="outline">Ver detalhes</Button>
      </CardFooter>
    </Card>
  ),
};

export const InDarkMode: Story = {
  render: () => (
    <div className="dark rounded-lg bg-background p-6">
      <Card className="w-[420px] shadow-card">
        <CardHeader>
          <div className="mb-2 flex items-center justify-between">
            <Badge variant="secondary">Projeto</Badge>
            <Badge>Ativo</Badge>
          </div>
          <CardTitle>Pipeline de oportunidades</CardTitle>
          <CardDescription>
            Visão de progresso por estágio e responsável.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-foreground">
            8 oportunidades ativas e 2 novas esta semana.
          </p>
          <p className="text-sm text-muted-foreground">
            Última sincronização em tempo real concluída.
          </p>
        </CardContent>
        <CardFooter className="gap-2">
          <Button variant="default">Abrir pipeline</Button>
          <Button variant="outline">Ver relatório</Button>
        </CardFooter>
      </Card>
    </div>
  ),
  parameters: {
    backgrounds: { default: "dark" },
  },
};
