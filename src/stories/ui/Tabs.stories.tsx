import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const meta = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[480px]">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Visão geral</TabsTrigger>
        <TabsTrigger value="membros">Membros</TabsTrigger>
        <TabsTrigger value="documentos">Documentos</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="rounded-md border p-4">
        <p className="text-sm text-foreground">
          Resumo do pipeline e status dos projetos ativos.
        </p>
      </TabsContent>

      <TabsContent value="membros" className="rounded-md border p-4">
        <p className="text-sm text-foreground">
          Lista de membros por papel e permissões.
        </p>
      </TabsContent>

      <TabsContent value="documentos" className="rounded-md border p-4">
        <p className="text-sm text-foreground">
          Documentos recentes e pendências de validação.
        </p>
      </TabsContent>
    </Tabs>
  ),
};
