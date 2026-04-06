import Link from 'next/link';
import Image from 'next/image';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui';

export default function SignupSuccessPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/logotipo.png"
          alt="Mary"
          width={100}
          height={40}
          className="h-10 w-auto"
        />
      </div>

      <Card className="w-full max-w-md text-center">
        <CardHeader>
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <CardTitle className="mt-4">Conta criada com sucesso!</CardTitle>
          <CardDescription>
            Sua conta foi criada e está pronta para uso.
            Faça login para acessar a plataforma.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="p-4 rounded-lg bg-secondary border border-border">
            <p className="text-sm text-foreground">
              🔐 <strong>Próximo passo:</strong> Ao fazer login, você precisará verificar 
              seu número de telefone via WhatsApp/SMS para segurança adicional.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <Button asChild className="w-full">
            <Link href="/login">
              Fazer Login
            </Link>
          </Button>
          <Button variant="secondary" asChild className="w-full">
            <Link href="/">
              Voltar para Início
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
