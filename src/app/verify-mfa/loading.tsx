import Image from 'next/image';
import {
  Card,
  CardHeader,
  CardContent,
  Skeleton,
  Spinner,
} from '@/components/ui';

export default function VerifyMfaLoading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Image
            src="/logotipo.png"
            alt="Mary"
            width={220}
            height={80}
            className="mx-auto h-16 w-auto"
            priority
          />
        </div>

        {/* Loading Card */}
        <Card>
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Spinner size="sm" variant="muted" />
              <p className="text-sm">Preparando sua verificação...</p>
            </div>
            <Skeleton className="w-16 h-16 mx-auto rounded-full" />
            <Skeleton className="h-8 w-1/2 mx-auto mt-4" />
            <Skeleton className="h-4 w-3/4 mx-auto mt-2" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-2 mb-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="w-12 h-14 rounded-md" />
              ))}
            </div>
            <Skeleton className="h-10 w-full rounded-md" />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
