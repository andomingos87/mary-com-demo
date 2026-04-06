'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Users,
  Shield,
  UserPlus,
  Loader2,
  Search,
  Clock,
  XCircle,
  FileKey,
  ShieldCheck,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  grantAccess,
  revokeAccess,
  listPermissionsWithDetails,
  searchOrganizations,
} from '@/lib/actions/vdr'
import type { VdrAccessPermission } from '@/types/vdr'

// =========================================
// Types
// =========================================

interface VdrPermissionsPanelProps {
  projectId: string
}

interface PermissionWithOrg extends VdrAccessPermission {
  grantee_org?: {
    id: string
    name: string
    slug: string
    profile_type: string
  } | null
}

// =========================================
// Main Panel
// =========================================

export function VdrPermissionsPanel({ projectId }: VdrPermissionsPanelProps) {
  const router = useRouter()
  const [permissions, setPermissions] = useState<PermissionWithOrg[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [grantDialogOpen, setGrantDialogOpen] = useState(false)
  const [isPostNda, setIsPostNda] = useState(false)
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [permissionToRevoke, setPermissionToRevoke] = useState<string | null>(null)
  const [isRevoking, setIsRevoking] = useState(false)

  const loadPermissions = useCallback(async () => {
    setIsLoading(true)
    const result = await listPermissionsWithDetails(projectId)
    if (result.success && result.data) {
      setPermissions(result.data as PermissionWithOrg[])
    }
    setIsLoading(false)
  }, [projectId])

  useEffect(() => {
    loadPermissions()
  }, [loadPermissions])

  const handleRevoke = async () => {
    if (!permissionToRevoke) return

    setIsRevoking(true)
    const result = await revokeAccess(permissionToRevoke)
    setIsRevoking(false)

    if (result.success) {
      setRevokeDialogOpen(false)
      setPermissionToRevoke(null)
      loadPermissions()
      router.refresh()
    }
  }

  const openGrantDialog = (postNda = false) => {
    setIsPostNda(postNda)
    setGrantDialogOpen(true)
  }

  const onGrantSuccess = () => {
    setGrantDialogOpen(false)
    loadPermissions()
    router.refresh()
  }

  const permissionTypeLabel: Record<string, string> = {
    view: 'Visualizar',
    download: 'Download',
    share: 'Compartilhar',
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Permissões de Acesso</CardTitle>
              <CardDescription>
                Gerencie quem pode acessar o VDR deste projeto
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openGrantDialog(false)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Conceder Acesso
            </Button>
            <Button
              size="sm"
              onClick={() => openGrantDialog(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <FileKey className="h-4 w-4 mr-2" />
              Acesso pós-NDA
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : permissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Nenhum investidor tem acesso ao VDR ainda.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Conceda acesso para que investidores possam visualizar os documentos.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {permissions.map((perm) => (
              <div
                key={perm.id}
                className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="p-2 bg-primary/10 rounded-full shrink-0">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {perm.grantee_org?.name || 'Organização desconhecida'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {permissionTypeLabel[perm.permission_type] || perm.permission_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Concedido{' '}
                      {formatDistanceToNow(new Date(perm.granted_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                    {perm.expires_at && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Expira{' '}
                        {formatDistanceToNow(new Date(perm.expires_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPermissionToRevoke(perm.id)
                    setRevokeDialogOpen(true)
                  }}
                  className="text-destructive hover:text-destructive shrink-0"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Revogar
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Grant Access Dialog */}
      <GrantAccessDialog
        open={grantDialogOpen}
        onOpenChange={setGrantDialogOpen}
        projectId={projectId}
        isPostNda={isPostNda}
        onSuccess={onGrantSuccess}
      />

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar acesso?</AlertDialogTitle>
            <AlertDialogDescription>
              O investidor perderá acesso imediato a todos os documentos do VDR.
              Esta ação pode ser revertida concedendo acesso novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevoking}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              disabled={isRevoking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRevoking ? 'Revogando...' : 'Revogar Acesso'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

// =========================================
// Grant Access Dialog (internal)
// =========================================

interface GrantAccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  isPostNda: boolean
  onSuccess: () => void
}

function GrantAccessDialog({
  open,
  onOpenChange,
  projectId,
  isPostNda,
  onSuccess,
}: GrantAccessDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<
    Array<{ id: string; name: string; slug: string; profile_type: string }>
  >([])
  const [selectedOrg, setSelectedOrg] = useState<{ id: string; name: string } | null>(null)
  const [permissionType, setPermissionType] = useState<string>('view')
  const [expiresInDays, setExpiresInDays] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isGranting, setIsGranting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    const result = await searchOrganizations(query, 'investor')
    if (result.success && result.data) {
      setSearchResults(result.data)
    }
    setIsSearching(false)
  }

  const handleGrant = async () => {
    if (!selectedOrg) {
      setError('Selecione uma organização')
      return
    }

    setError(null)
    setIsGranting(true)

    let expiresAt: string | undefined
    if (expiresInDays) {
      const days = parseInt(expiresInDays)
      if (days > 0) {
        const date = new Date()
        date.setDate(date.getDate() + days)
        expiresAt = date.toISOString()
      }
    }

    const result = await grantAccess({
      projectId,
      granteeOrgId: selectedOrg.id,
      permissionType: permissionType as 'view' | 'download' | 'share',
      expiresAt,
    })

    setIsGranting(false)

    if (result.success) {
      handleClose()
      onSuccess()
    } else {
      setError(result.error || 'Erro ao conceder acesso')
    }
  }

  const handleClose = () => {
    setSearchQuery('')
    setSearchResults([])
    setSelectedOrg(null)
    setPermissionType('view')
    setExpiresInDays('')
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isPostNda ? 'Conceder Acesso pós-NDA' : 'Conceder Acesso ao VDR'}
          </DialogTitle>
          <DialogDescription>
            {isPostNda
              ? 'Conceda acesso após a assinatura do NDA. Quando o módulo Pipeline estiver disponível, esta ação será automatizada.'
              : 'Selecione uma organização investidora para conceder acesso ao VDR.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Organization Search */}
          {!selectedOrg ? (
            <div className="grid gap-2">
              <Label>Organização Investidora *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              {/* Search Results */}
              {(searchResults.length > 0 || isSearching) && (
                <div className="border rounded-md max-h-48 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-3 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    searchResults.map((org) => (
                      <button
                        key={org.id}
                        type="button"
                        onClick={() => {
                          setSelectedOrg({ id: org.id, name: org.name })
                          setSearchResults([])
                          setSearchQuery('')
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors border-b last:border-b-0"
                      >
                        <p className="font-medium">{org.name}</p>
                        <p className="text-xs text-muted-foreground">{org.slug}</p>
                      </button>
                    ))
                  )}
                </div>
              )}

              {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                <p className="text-xs text-muted-foreground">
                  Nenhuma organização investidora encontrada.
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-2">
              <Label>Organização Selecionada</Label>
              <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{selectedOrg.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOrg(null)}
                >
                  Alterar
                </Button>
              </div>
            </div>
          )}

          {/* Permission Type */}
          <div className="grid gap-2">
            <Label>Tipo de Permissão</Label>
            <Select value={permissionType} onValueChange={setPermissionType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">Visualizar</SelectItem>
                <SelectItem value="download">Download</SelectItem>
                <SelectItem value="share">Compartilhar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Expiration */}
          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Expiração (opcional)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="30"
                min="1"
                max="365"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">dias</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Deixe vazio para acesso sem expiração
            </p>
          </div>

          {/* Post-NDA Note */}
          {isPostNda && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-md border border-emerald-200 dark:border-emerald-800">
              <p className="text-sm text-emerald-800 dark:text-emerald-200">
                <FileKey className="h-4 w-4 inline mr-1" />
                Acesso será concedido com nota: &ldquo;Acesso concedido após assinatura de NDA&rdquo;
              </p>
            </div>
          )}

          {/* Error */}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleGrant}
            disabled={isGranting || !selectedOrg}
            className={isPostNda ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
          >
            {isGranting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isPostNda ? 'Conceder Acesso pós-NDA' : 'Conceder Acesso'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
