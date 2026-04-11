'use client';

import { Suspense, useState, useTransition, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  Button,
  Input,
  Label,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Alert,
  AlertDescription,
  Spinner,
  Badge,
} from '@/components/ui';
import { signupAction } from '@/lib/actions/auth';
import { isGenericEmail, GENERIC_EMAIL_ERROR_MESSAGE } from '@/lib/validation/email';
import { INVESTOR_TYPE_OPTIONS } from '@/lib/constants/investor-types';
import { Briefcase, Building2, Users, ArrowLeft } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ProfileType = 'investor' | 'asset' | 'advisor';

function normalizeHttpUrl(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const withProto = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    const u = new URL(withProto);
    if (!u.hostname || !u.hostname.includes('.')) return null;
    return u.origin + (u.pathname === '/' ? '' : u.pathname) + u.search + u.hash;
  } catch {
    return null;
  }
}

const PROFILE_LANDING: Record<ProfileType, string> = {
  investor: '/invest',
  asset: '/sell-raise',
  advisor: '/advise',
};

const PROFILE_INFO: Record<ProfileType, { name: string; icon: React.ReactNode; description: string }> = {
  investor: {
    name: 'Investidor',
    icon: <Briefcase className="h-4 w-4" />,
    description: 'PEs, VCs, Family Offices, Corporates, Angels, CVCs, Venture Builders, Sovereigns, Pension Funds, Search Funds, Aceleradoras e Incubadoras'
  },
  asset: {
    name: 'Empresa',
    icon: <Building2 className="h-4 w-4" />,
    description: 'Qualquer porte, segmento ou região'
  },
  advisor: {
    name: 'Advisor',
    icon: <Users className="h-4 w-4" />,
    description: 'Bancos de investimento (IBs), boutiques de M&A, escritórios de advocacia, contabilidade, auditorias'
  },
};

// Loading component for Suspense fallback
function SignupLoading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <Spinner size="lg" />
      <p className="mt-4 text-muted-foreground">Carregando...</p>
    </main>
  );
}

// Main signup form that uses useSearchParams
function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('signup');
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [investorType, setInvestorType] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
    const score = Object.values(checks).filter(Boolean).length;
    let level: 'weak' | 'medium' | 'strong' | 'very-strong' = 'weak';
    if (score === 4) level = 'very-strong';
    else if (score === 3) level = 'strong';
    else if (score === 2) level = 'medium';
    return { checks, score, level };
  };

  const passwordStrength = getPasswordStrength(password);
  
  // Get profile from URL
  const profileParam = searchParams.get('profile') as ProfileType | null;
  const isValidProfile = profileParam && ['investor', 'asset', 'advisor'].includes(profileParam);
  
  // Redirect if no valid profile
  useEffect(() => {
    if (!isValidProfile) {
      router.replace('/?error=profile-required');
    }
  }, [isValidProfile, router]);
  
  // Combined loading state
  const loading = isPending;
  
  // If no valid profile, show loading while redirecting
  if (!isValidProfile) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Redirecionando...</p>
      </main>
    );
  }
  
  const profileInfo = PROFILE_INFO[profileParam];

  const formatPhone = (value: string) => {
    // Remove non-digits
    let digits = value.replace(/\D/g, '');

    // Auto-add Brazil country code if not present
    if (digits.length > 0 && !digits.startsWith('55')) {
      // If user starts typing area code (2 digits starting with valid DDD)
      if (digits.length >= 2) {
        digits = '55' + digits;
      }
    }

    // Format as Brazilian phone: +55 (11) 99999-9999 or +55 (11) 9999-9999
    if (digits.length <= 2) return digits.length > 0 ? `+${digits}` : '';
    if (digits.length <= 4) return `+${digits.slice(0, 2)} (${digits.slice(2)}`;
    if (digits.length <= 6) return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4)}`;

    // Handle 8-digit landlines (10 digits total with DDD) vs 9-digit mobiles (11 digits with DDD)
    const areaCode = digits.slice(2, 4);
    const phoneNumber = digits.slice(4);

    if (phoneNumber.length <= 4) {
      return `+${digits.slice(0, 2)} (${areaCode}) ${phoneNumber}`;
    } else if (phoneNumber.length <= 8) {
      // 8-digit landline: 9999-9999
      return `+${digits.slice(0, 2)} (${areaCode}) ${phoneNumber.slice(0, 4)}-${phoneNumber.slice(4)}`;
    } else {
      // 9-digit mobile: 99999-9999
      return `+${digits.slice(0, 2)} (${areaCode}) ${phoneNumber.slice(0, 5)}-${phoneNumber.slice(5, 9)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    // Validate phone
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 12) {
      setError('Número de telefone inválido. Use o formato: +55 (11) 99999-9999');
      return;
    }

    // TASK-004: Validate corporate email (block generic email providers)
    if (isGenericEmail(email)) {
      setError(GENERIC_EMAIL_ERROR_MESSAGE);
      return;
    }

    const siteNorm = normalizeHttpUrl(website);
    if ((profileParam === 'investor' || profileParam === 'asset' || profileParam === 'advisor') && !siteNorm) {
      setError(t('validation_website'));
      return;
    }

    if (profileParam === 'investor' && !investorType) {
      setError(t('validation_investor_type'));
      return;
    }

    let linkedinNorm: string | undefined;
    if (profileParam === 'advisor') {
      const ln = normalizeHttpUrl(linkedinUrl.trim());
      if (!ln || !ln.toLowerCase().includes('linkedin.com')) {
        setError(t('validation_linkedin'));
        return;
      }
      linkedinNorm = ln;
    }

    startTransition(async () => {
      try {
        const result = await signupAction({
          name,
          email,
          phone: `+${phoneDigits}`,
          password,
          profileType: profileParam,
          website: siteNorm ?? undefined,
          investorType: profileParam === 'investor' ? investorType : undefined,
          linkedinUrl: linkedinNorm,
        });

        if (!result.success) {
          setError(result.error || 'Falha no cadastro');
          return;
        }

        // Redirect to success page
        router.push('/signup/success');
      } catch (err) {
        setError('Erro de conexão. Tente novamente.');
      }
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        {/* Back to profile selection */}
        <Button 
          variant="ghost" 
          size="sm" 
          asChild 
          className="mb-4"
        >
          <Link href={PROFILE_LANDING[profileParam]}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Trocar perfil
          </Link>
        </Button>

        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/logotipo.png"
              alt="Mary"
              width={120}
              height={48}
              className="h-12 w-auto"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Mary é uma infraestrutura de Market Network nativa em IA, liderada por pessoas, que
            impulsiona os mercados privados em escala global
          </p>
          <p className="mt-3 text-muted-foreground">Crie sua conta</p>
        </div>

        {/* Selected Profile Badge */}
        <div className="flex justify-center mb-6">
          <Badge 
            variant="secondary" 
            className="px-6 py-3 text-sm flex flex-col items-center justify-center text-center h-auto max-w-full gap-1.5 rounded-xl sm:rounded-full"
          >
            <div className="flex items-center font-bold">
              <span className="mr-2">{profileInfo.icon}</span>
              {profileInfo.name}
            </div>
            <span className="text-muted-foreground text-xs sm:text-sm leading-tight">
              {profileInfo.description}
            </span>
          </Badge>
        </div>

        {/* Signup Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Cadastro de {profileInfo.name}</CardTitle>
            <CardDescription>
              Preencha os dados para criar sua conta
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">{t('website_label')}</Label>
                <Input
                  id="website"
                  type="url"
                  inputMode="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://www.suaempresa.com"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">{t('website_hint')}</p>
              </div>

              {profileParam === 'investor' && (
                <div className="space-y-2">
                  <Label>{t('investor_type_label')}</Label>
                  <Select
                    value={investorType || undefined}
                    onValueChange={setInvestorType}
                    required
                    disabled={loading}
                  >
                    <SelectTrigger aria-label={t('investor_type_label')}>
                      <SelectValue placeholder={t('investor_type_placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {INVESTOR_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {profileParam === 'advisor' && (
                <div className="space-y-2">
                  <Label htmlFor="linkedin">{t('linkedin_label')}</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    inputMode="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/company/..."
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">{t('linkedin_hint')}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone">WhatsApp</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="+55 (11) 99999-9999"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Usado para verificação em duas etapas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    required
                    minLength={8}
                    disabled={loading}
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {/* Strength Bar */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            passwordStrength.score >= level
                              ? passwordStrength.level === 'very-strong'
                                ? 'bg-green-500'
                                : passwordStrength.level === 'strong'
                                ? 'bg-green-400'
                                : passwordStrength.level === 'medium'
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                              : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${
                      passwordStrength.level === 'very-strong' ? 'text-green-600' :
                      passwordStrength.level === 'strong' ? 'text-green-500' :
                      passwordStrength.level === 'medium' ? 'text-yellow-600' :
                      'text-red-500'
                    }`}>
                      {passwordStrength.level === 'very-strong' ? 'Muito forte' :
                       passwordStrength.level === 'strong' ? 'Forte' :
                       passwordStrength.level === 'medium' ? 'Média' :
                       'Fraca'}
                    </p>
                    {/* Requirements Checklist */}
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className={`flex items-center gap-1 ${passwordStrength.checks.length ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {passwordStrength.checks.length ? (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" strokeWidth={2} />
                          </svg>
                        )}
                        8+ caracteres
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.checks.uppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {passwordStrength.checks.uppercase ? (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" strokeWidth={2} />
                          </svg>
                        )}
                        Letra maiuscula
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.checks.number ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {passwordStrength.checks.number ? (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" strokeWidth={2} />
                          </svg>
                        )}
                        Numero
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.checks.special ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {passwordStrength.checks.special ? (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" strokeWidth={2} />
                          </svg>
                        )}
                        Caractere especial
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Digite a senha novamente"
                    required
                    disabled={loading}
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  required
                  className="w-4 h-4 mt-0.5 rounded border-input bg-background text-primary focus:ring-ring focus:ring-offset-0"
                />
                <span className="ml-2 text-sm text-muted-foreground">
                  Li e aceito os{' '}
                  <Link
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    Termos de Uso
                  </Link>{' '}
                  e a{' '}
                  <Link
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    Política de Privacidade
                  </Link>
                </span>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Spinner variant="white" size="sm" className="mr-2" />
                    Criando conta...
                  </span>
                ) : (
                  'Criar conta'
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link
                href="/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Entrar
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

// Main page component with Suspense boundary
export default function SignupPage() {
  return (
    <Suspense fallback={<SignupLoading />}>
      <SignupForm />
    </Suspense>
  );
}
