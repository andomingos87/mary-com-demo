"use client";

import { useState } from "react";
import { Terminal, User } from "lucide-react";
import {
  DesignSystemSection,
  DemoSurface,
  DemoRow,
} from "@/components/design-system/design-system-demos";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BUTTON_VARIANTS = [
  "default",
  "destructive",
  "outline",
  "secondary",
  "ghost",
  "link",
  "hero",
  "cta",
  "premium",
  "professional",
] as const;

export function DesignSystemPrimitives() {
  const [progress, setProgress] = useState(42);
  const [menuChecked, setMenuChecked] = useState(true);
  const [radio, setRadio] = useState("one");
  const [menuRadio, setMenuRadio] = useState("one");

  return (
    <DesignSystemSection
      id="primitives"
      title="Componentes (src/components/ui)"
      description="Primitives shadcn/Radix usados na plataforma. Interaja para ver estados e overlays."
    >
      <div className="space-y-14">
        <div>
          <h3 className="mb-4 text-sm font-semibold">Button</h3>
          <div className="space-y-4">
            <DemoRow>
              {BUTTON_VARIANTS.map((v) => (
                <Button key={v} variant={v} type="button">
                  {v}
                </Button>
              ))}
            </DemoRow>
            <DemoRow>
              <Button size="sm" type="button">
                Small
              </Button>
              <Button size="default" type="button">
                Default
              </Button>
              <Button size="lg" type="button">
                Large
              </Button>
              <Button size="icon" type="button" aria-label="Icon">
                <User className="h-4 w-4" />
              </Button>
            </DemoRow>
            <DemoRow>
              <Button disabled type="button">
                Disabled
              </Button>
            </DemoRow>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold">Badge</h3>
          <DemoRow>
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </DemoRow>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold">Alert</h3>
          <div className="space-y-4">
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Heads up</AlertTitle>
              <AlertDescription>
                Descrição de alerta padrão com ícone e texto legível.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>
                Variante destrutiva para feedback crítico.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold">Card</h3>
          <Card className="max-w-md shadow-card">
            <CardHeader>
              <CardTitle>Título do card</CardTitle>
              <CardDescription>Descrição curta com tom muted.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Conteúdo principal do card.
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button size="sm" type="button">
                Ação
              </Button>
              <Button size="sm" variant="outline" type="button">
                Secundária
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold">Label, Input, Textarea</h3>
          <DemoSurface className="max-w-md space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ds-input">E-mail</Label>
              <Input id="ds-input" type="email" placeholder="voce@empresa.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ds-input-err">Com erro</Label>
              <Input id="ds-input-err" error placeholder="Valor inválido" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ds-textarea">Mensagem</Label>
              <Textarea id="ds-textarea" placeholder="Texto longo..." rows={3} />
            </div>
          </DemoSurface>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold">Checkbox e Radio</h3>
          <DemoRow>
            <div className="flex items-center gap-2">
              <Checkbox id="ds-c1" defaultChecked />
              <Label htmlFor="ds-c1">Marcado</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="ds-c2" />
              <Label htmlFor="ds-c2">Desmarcado</Label>
            </div>
          </DemoRow>
          <div className="mt-4">
            <RadioGroup value={radio} onValueChange={setRadio} className="flex gap-6">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="one" id="r1" />
                <Label htmlFor="r1">Opção A</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="two" id="r2" />
                <Label htmlFor="r2">Opção B</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold">Progress</h3>
          <DemoSurface className="max-w-md space-y-3">
            <Progress value={progress} />
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setProgress((p) => Math.max(0, p - 10))}
              >
                −
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setProgress((p) => Math.min(100, p + 10))}
              >
                +
              </Button>
            </div>
          </DemoSurface>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold">Skeleton e Spinner</h3>
          <DemoRow className="items-center">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-12 rounded-full" />
            <Spinner />
            <Spinner size="sm" />
            <Spinner size="lg" variant="muted" />
          </DemoRow>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold">Separator</h3>
          <DemoSurface>
            <p className="text-sm">Texto acima</p>
            <Separator className="my-4" />
            <p className="text-sm">Texto abaixo</p>
            <div className="mt-4 flex h-16 items-stretch gap-4">
              <span className="text-sm">Esquerda</span>
              <Separator orientation="vertical" />
              <span className="text-sm">Direita</span>
            </div>
          </DemoSurface>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold">Tabs</h3>
          <Tabs defaultValue="a" className="max-w-md">
            <TabsList>
              <TabsTrigger value="a">Aba 1</TabsTrigger>
              <TabsTrigger value="b">Aba 2</TabsTrigger>
            </TabsList>
            <TabsContent value="a">
              <p className="text-sm text-muted-foreground">Conteúdo da aba 1.</p>
            </TabsContent>
            <TabsContent value="b">
              <p className="text-sm text-muted-foreground">Conteúdo da aba 2.</p>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold">Select</h3>
          <div className="max-w-xs">
            <Select defaultValue="br">
              <SelectTrigger>
                <SelectValue placeholder="Idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="br">Português</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold">Tooltip</h3>
          <DemoRow>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  Passe o mouse
                </Button>
              </TooltipTrigger>
              <TooltipContent>Texto do tooltip</TooltipContent>
            </Tooltip>
          </DemoRow>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold">Popover</h3>
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                Abrir popover
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <p className="text-sm font-medium">Título</p>
              <p className="text-xs text-muted-foreground">
                Conteúdo em painel flutuante.
              </p>
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold">Dropdown menu</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline">
                Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuItem>
                Atalho
                <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Mais</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Subitem</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={menuChecked}
                onCheckedChange={setMenuChecked}
              >
                Checkbox
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={menuRadio} onValueChange={setMenuRadio}>
                <DropdownMenuRadioItem value="one">Radio A</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="two">Radio B</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold">Dialog</h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
                Abrir dialog
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog</DialogTitle>
                <DialogDescription>
                  Modal centralizado com overlay.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" variant="outline">
                  Fechar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold">Alert dialog</h3>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive">
                Confirmar exclusão
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir item?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold">Sheet</h3>
          <div className="flex flex-wrap gap-2">
            {(["top", "bottom", "left", "right"] as const).map((side) => (
              <Sheet key={side}>
                <SheetTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    Sheet {side}
                  </Button>
                </SheetTrigger>
                <SheetContent side={side}>
                  <SheetHeader>
                    <SheetTitle>Sheet</SheetTitle>
                    <SheetDescription>
                      Painel lateral ({side}).
                    </SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold">Collapsible</h3>
          <Collapsible className="max-w-md rounded-lg border border-border px-4 py-2">
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" className="w-full justify-between p-0">
                <span>Expandir</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 text-sm text-muted-foreground">
              Conteúdo oculto até expandir.
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold">Avatar</h3>
          <DemoRow>
            <Avatar>
              <AvatarImage src="https://avatars.githubusercontent.com/u/9919?v=4" alt="User" />
              <AvatarFallback>GH</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                MA
              </AvatarFallback>
            </Avatar>
          </DemoRow>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold">Scroll area</h3>
          <ScrollArea className="h-40 max-w-md rounded-lg border border-border p-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <p key={i} className="mb-2 text-sm text-muted-foreground">
                Linha {i + 1} — rolagem vertical.
              </p>
            ))}
          </ScrollArea>
        </div>
      </div>
    </DesignSystemSection>
  );
}
