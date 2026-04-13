import { Bot } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function DemoAiQueueCard({ prompts }: { prompts: string[] }) {
  return (
    <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Mary AI</CardTitle>
            <CardDescription>Fila mockada de apoio contextual e operacional.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {prompts.map((prompt) => (
          <div key={prompt} className="rounded-2xl bg-muted/50 p-3 text-sm text-muted-foreground">
            {prompt}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
