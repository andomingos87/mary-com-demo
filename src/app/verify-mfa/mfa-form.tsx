'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Alert,
  AlertDescription,
  Spinner,
  Separator,
} from '@/components/ui';
import { verifyMfaAction, resendOtpAction } from '@/lib/actions/auth';

interface MfaFormProps {
  sessionId: string;
  channel: 'whatsapp' | 'sms';
  testOtpCode?: string;
}

export function MfaForm({ sessionId, channel, testOtpCode }: MfaFormProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [visibleTestOtpCode, setVisibleTestOtpCode] = useState(testOtpCode);
  const [isPending, startTransition] = useTransition();
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    // Countdown timer for resend
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (value && index === 5) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        handleSubmit(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
      handleSubmit(pastedData);
    }
  };

  const handleSubmit = async (fullCode?: string) => {
    const codeToSubmit = fullCode || code.join('');

    if (codeToSubmit.length !== 6) {
      setError('Digite o código completo de 6 dígitos');
      return;
    }

    setError('');

    startTransition(async () => {
      try {
        const result = await verifyMfaAction({ code: codeToSubmit, sessionId });

        if (!result.success) {
          setError(result.error || 'Código inválido');
          setCode(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
          return;
        }

        // Use hard navigation to avoid client-side cookie race conditions
        // right after MFA verification.
        window.location.href = result.data?.redirectTo || '/dashboard';
      } catch {
        setError('Erro de conexão. Tente novamente.');
      }
    });
  };

  const handleResend = async () => {
    setResending(true);
    setError('');

    try {
      const result = await resendOtpAction(channel);

      if (!result.success) {
        setError(result.error || 'Falha ao reenviar código');
        return;
      }

      // Start countdown
      setCountdown(60);
      setVisibleTestOtpCode(result.data?.testOtpCode);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setResending(false);
    }
  };

  const channelName = channel === 'whatsapp' ? 'WhatsApp' : 'SMS';
  const channelIcon = channel === 'whatsapp' ? '📱' : '💬';

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

        {/* Verification Card */}
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
              {channelIcon}
            </div>
            <CardTitle>Verificação</CardTitle>
            <CardDescription>
              Digite o código de 6 dígitos enviado para seu {channelName}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-center">{error}</AlertDescription>
              </Alert>
            )}

            {visibleTestOtpCode && (
              <Alert>
                <AlertDescription className="text-center">
                  <span className="block text-sm text-muted-foreground">Código de teste (somente dev/homologação)</span>
                  <span className="block text-2xl font-bold tracking-widest text-foreground mt-1">
                    {visibleTestOtpCode}
                  </span>
                </AlertDescription>
              </Alert>
            )}

            {/* OTP Input */}
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isPending}
                  className="w-12 h-14 text-center text-2xl font-bold rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50"
                />
              ))}
            </div>

            {/* Timer */}
            <div className="space-y-1 text-center">
              <p className="text-sm text-muted-foreground">
                O código expira em 5 minutos
              </p>
              <p className="text-xs text-muted-foreground">
                Se reenviar, apenas o ultimo codigo recebido sera valido.
              </p>
            </div>

            {/* Verify Button */}
            <Button
              onClick={() => handleSubmit()}
              disabled={isPending || code.join('').length !== 6}
              className="w-full"
            >
              {isPending ? (
                <span className="flex items-center justify-center">
                  <Spinner variant="white" size="sm" className="mr-2" />
                  Verificando...
                </span>
              ) : (
                'Verificar'
              )}
            </Button>

            {/* Resend */}
            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Reenviar código em <span className="text-primary font-medium">{countdown}s</span>
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resending || isPending}
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50"
                >
                  {resending ? 'Reenviando...' : 'Não recebeu? Reenviar código'}
                </button>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">ou</span>
              </div>
            </div>

            <Button variant="secondary" asChild className="w-full">
              <Link href="/login">
                Voltar para Login
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Help Text */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Problemas para receber o código? Entre em contato com o suporte.
        </p>
      </div>
    </main>
  );
}
