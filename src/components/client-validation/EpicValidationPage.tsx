'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Progress, Textarea } from '@/components/ui';
import {
  type ChecklistStatus,
  type FinalStatus,
  type ValidationUser,
  VALIDATION_EPICS,
  VALIDATION_USERS,
} from '@/lib/client-validation/epics';

interface ItemAnswer {
  status: ChecklistStatus;
  comment: string;
}

interface EpicResponse {
  epicId: string;
  epicTitle: string;
  userName: ValidationUser;
  answers: Record<string, ItemAnswer>;
  generalComment: string;
  finalStatus: FinalStatus;
  finalComment: string;
  pendencias: string;
  progressPercent: number;
  updatedAt?: string;
}

const STATUS_OPTIONS: Array<{ value: ChecklistStatus; label: string }> = [
  { value: 'approved', label: 'Aprovado ✅' },
  { value: 'rejected', label: 'Reprovado ❌' },
  { value: 'bug', label: 'Bug 🪲' },
];

const FINAL_STATUS_OPTIONS: FinalStatus[] = ['Aprovado', 'Reprovado', 'Pendencias'];

function calculateProgress(
  checklistSize: number,
  answers: Record<string, ItemAnswer> | undefined
): number {
  if (!checklistSize || !answers) return 0;
  const answered = Object.values(answers).filter((item) => item.status !== 'pending').length;
  return Math.round((answered / checklistSize) * 100);
}

function createEmptyResponse(userName: ValidationUser, epicId: string, epicTitle: string): EpicResponse {
  return {
    epicId,
    epicTitle,
    userName,
    answers: {},
    generalComment: '',
    finalStatus: 'Pendencias',
    finalComment: '',
    pendencias: '',
    progressPercent: 0,
  };
}

export function EpicValidationPage() {
  const [selectedUser, setSelectedUser] = useState<ValidationUser | null>(null);
  const [selectedEpicId, setSelectedEpicId] = useState<string>('E1');
  const [responsesByEpic, setResponsesByEpic] = useState<Record<string, EpicResponse>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string>('');

  const orderedEpics = useMemo(
    () =>
      [...VALIDATION_EPICS].sort((a, b) => {
        const aNumber = Number(a.id.replace('E', ''));
        const bNumber = Number(b.id.replace('E', ''));
        return aNumber - bNumber;
      }),
    []
  );

  const enabledEpicIds = useMemo(() => new Set(['E1', 'E2', 'E3', 'E4']), []);
  const availableEpics = useMemo(
    () => orderedEpics.filter((epic) => enabledEpicIds.has(epic.id)),
    [enabledEpicIds, orderedEpics]
  );

  useEffect(() => {
    if (enabledEpicIds.has(selectedEpicId)) return;
    const fallbackEpicId = availableEpics[0]?.id ?? orderedEpics[0]?.id ?? 'E1';
    setSelectedEpicId(fallbackEpicId);
  }, [availableEpics, enabledEpicIds, orderedEpics, selectedEpicId]);

  const selectedEpic = useMemo(
    () => orderedEpics.find((epic) => epic.id === selectedEpicId) ?? orderedEpics[0],
    [orderedEpics, selectedEpicId]
  );

  const selectedResponse = useMemo(() => {
    if (!selectedUser || !selectedEpic) return null;
    return (
      responsesByEpic[selectedEpic.id] ??
      createEmptyResponse(selectedUser, selectedEpic.id, selectedEpic.title)
    );
  }, [responsesByEpic, selectedEpic, selectedUser]);

  const overallProgress = useMemo(() => {
    if (!selectedUser || availableEpics.length === 0) return 0;
    const total = availableEpics.reduce((acc, epic) => {
      const response = responsesByEpic[epic.id];
      return acc + calculateProgress(epic.checklist.length, response?.answers);
    }, 0);
    return Math.round(total / availableEpics.length);
  }, [availableEpics, responsesByEpic, selectedUser]);

  useEffect(() => {
    const savedUser = window.localStorage.getItem('validation-user') as ValidationUser | null;
    if (savedUser && VALIDATION_USERS.includes(savedUser)) {
      setSelectedUser(savedUser);
    }
  }, []);

  useEffect(() => {
    if (!selectedUser) return;

    const loadResponses = async () => {
      setIsLoading(true);
      setFeedback('');
      try {
        const response = await fetch(`/api/client-validation?userName=${selectedUser}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Erro ao carregar validacoes');
        }

        const mapped: Record<string, EpicResponse> = {};
        (result.data ?? []).forEach((item: any) => {
          mapped[item.epic_id] = {
            epicId: item.epic_id,
            epicTitle: item.epic_title,
            userName: item.user_name,
            answers: (item.answers ?? {}) as Record<string, ItemAnswer>,
            generalComment: item.general_comment ?? '',
            finalStatus: (item.final_status ?? 'Pendencias') as FinalStatus,
            finalComment: item.final_comment ?? '',
            pendencias: item.pendencias ?? '',
            progressPercent: item.progress_percent ?? 0,
            updatedAt: item.updated_at ?? undefined,
          };
        });
        setResponsesByEpic(mapped);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : 'Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    loadResponses();
  }, [selectedUser]);

  const selectUser = (user: ValidationUser) => {
    setSelectedUser(user);
    window.localStorage.setItem('validation-user', user);
  };

  const clearUser = () => {
    setSelectedUser(null);
    window.localStorage.removeItem('validation-user');
    setFeedback('');
  };

  const updateSelectedResponse = (updater: (current: EpicResponse) => EpicResponse) => {
    if (!selectedUser || !selectedEpic) return;
    setResponsesByEpic((prev) => {
      const current =
        prev[selectedEpic.id] ?? createEmptyResponse(selectedUser, selectedEpic.id, selectedEpic.title);
      const updated = updater(current);
      updated.progressPercent = calculateProgress(selectedEpic.checklist.length, updated.answers);
      return { ...prev, [selectedEpic.id]: updated };
    });
  };

  const saveCurrentResponse = async () => {
    if (!selectedUser || !selectedEpic || !selectedResponse) return;

    setIsSaving(true);
    setFeedback('');
    try {
      const response = await fetch('/api/client-validation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedResponse),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Erro ao salvar validacao');
      }

      setResponsesByEpic((prev) => ({
        ...prev,
        [selectedEpic.id]: {
          ...(prev[selectedEpic.id] ?? selectedResponse),
          updatedAt: result.data?.updated_at ?? new Date().toISOString(),
        },
      }));
      setFeedback('Validacao salva com sucesso.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Erro ao salvar validacao');
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedUser) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4">
          <Card className="w-full border-border shadow-card">
            <CardHeader>
              <CardTitle>Selecione o usuario da validacao</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {VALIDATION_USERS.map((user) => (
                <Button key={user} className="w-full" onClick={() => selectUser(user)}>
                  {user}
                </Button>
              ))}
              <p className="text-sm text-muted-foreground">
                Este modo e temporario e registra respostas por usuario.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (!selectedEpic || !selectedResponse) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4">
          <p className="text-muted-foreground">Nenhum epico configurado.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen overflow-hidden bg-background text-foreground">
      <div className="mx-auto flex h-screen w-full max-w-[1400px]">
        <aside className="flex h-screen w-80 flex-col border-r border-border bg-card text-card-foreground">
          <div className="border-b border-border p-4">
            <p className="text-sm text-muted-foreground">Validando como</p>
            <p className="text-lg font-semibold">{selectedUser}</p>
            <Button variant="outline" className="mt-3 w-full" onClick={clearUser}>
              Trocar usuario
            </Button>
          </div>

          <div className="flex-1 space-y-2 overflow-hidden p-3">
            {orderedEpics.map((epic) => {
              const progress = calculateProgress(epic.checklist.length, responsesByEpic[epic.id]?.answers);
              const isActive = epic.id === selectedEpic.id;
              const isEnabled = enabledEpicIds.has(epic.id);
              return (
                <button
                  key={epic.id}
                  type="button"
                  className={`w-full rounded-lg border p-3 text-left transition-smooth ${
                    isActive
                      ? 'border-primary bg-primary/10 text-foreground'
                      : isEnabled
                        ? 'border-border bg-background text-foreground hover:bg-muted'
                        : 'cursor-not-allowed border-border bg-background text-muted-foreground opacity-70'
                  }`}
                  onClick={() => {
                    if (!isEnabled) return;
                    setSelectedEpicId(epic.id);
                  }}
                  disabled={!isEnabled}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">
                      {epic.id} - {epic.title}
                    </p>
                    {!isEnabled && (
                      <span className="rounded-lg border border-border bg-muted px-2 py-1 text-xs text-muted-foreground">
                        Em breve
                      </span>
                    )}
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-success transition-smooth"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Progresso: {progress}%</p>
                </button>
              );
            })}
          </div>

          <div className="border-t border-border p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso geral</span>
              <span className="font-medium">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} />
          </div>
        </aside>

        <section className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6 pb-32">
          <header className="space-y-1">
            <h1 className="text-2xl font-semibold">
              {selectedEpic.id} - {selectedEpic.title}
            </h1>
            <p className="text-sm text-muted-foreground">Documento: {selectedEpic.documentPath}</p>
            {selectedResponse.updatedAt && (
              <p className="text-xs text-muted-foreground">
                Ultima atualizacao: {new Date(selectedResponse.updatedAt).toLocaleString('pt-BR')}
              </p>
            )}
          </header>

          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle>O que e</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {selectedEpic.whatIs.map((item) => (
                <p key={item} className="text-sm text-card-foreground">
                  - {item}
                </p>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle>O que foi implementado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {selectedEpic.implemented.map((item) => (
                <p key={item} className="text-sm text-card-foreground">
                  - {item}
                </p>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle>Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedEpic.checklist.map((item) => {
                const current = selectedResponse.answers[item.id] ?? { status: 'pending', comment: '' };
                return (
                  <div key={item.id} className="rounded-lg border border-border bg-background p-4">
                    <p className="mb-3 text-sm font-medium">
                      {item.id} - {item.label}
                    </p>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map((option) => (
                        <Button
                          key={option.value}
                          size="sm"
                          variant={current.status === option.value ? 'default' : 'outline'}
                          onClick={() =>
                            updateSelectedResponse((response) => ({
                              ...response,
                              answers: {
                                ...response.answers,
                                [item.id]: { ...current, status: option.value },
                              },
                            }))
                          }
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                    <Textarea
                      placeholder="Comentario opcional deste item"
                      value={current.comment}
                      onChange={(event) =>
                        updateSelectedResponse((response) => ({
                          ...response,
                          answers: {
                            ...response.answers,
                            [item.id]: { ...current, comment: event.target.value },
                          },
                        }))
                      }
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle>Mais comentarios</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Comentarios gerais da validacao"
                value={selectedResponse.generalComment}
                onChange={(event) =>
                  updateSelectedResponse((response) => ({
                    ...response,
                    generalComment: event.target.value,
                  }))
                }
              />
            </CardContent>
          </Card>

          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle>Resultado final por usuario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {FINAL_STATUS_OPTIONS.map((status) => (
                  <Button
                    key={status}
                    variant={selectedResponse.finalStatus === status ? 'default' : 'outline'}
                    onClick={() =>
                      updateSelectedResponse((response) => ({
                        ...response,
                        finalStatus: status,
                      }))
                    }
                  >
                    {status}
                  </Button>
                ))}
              </div>
              <Textarea
                placeholder="Comentario final"
                value={selectedResponse.finalComment}
                onChange={(event) =>
                  updateSelectedResponse((response) => ({
                    ...response,
                    finalComment: event.target.value,
                  }))
                }
              />
              <Textarea
                placeholder="Pendencias encontradas"
                value={selectedResponse.pendencias}
                onChange={(event) =>
                  updateSelectedResponse((response) => ({
                    ...response,
                    pendencias: event.target.value,
                  }))
                }
              />
            </CardContent>
          </Card>
          </div>
          <div className="sticky bottom-0 -mx-6 border-t border-border bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="flex flex-wrap items-center gap-3">
              <Button disabled={isLoading || isSaving} onClick={saveCurrentResponse}>
                {isSaving ? 'Salvando...' : 'Salvar validação'}
              </Button>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Carregando dados...' : feedback || 'Preencha e clique em salvar.'}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
