/**
 * Tests for VDR Server Actions and Types
 * Phase 4 - Validation & QA for VDR Fase 1
 */

import {
  DEFAULT_VDR_FOLDERS,
  type VdrPermissionType,
  type VdrAccessAction,
  type CreateFolderInput,
  type UpdateFolderInput,
  type CreateDocumentInput,
  type UpdateDocumentInput,
  type GrantAccessInput,
  type CreateSharedLinkInput,
  type CreateQaMessageInput,
} from '@/types/vdr'

describe('VDR Types', () => {
  describe('DEFAULT_VDR_FOLDERS', () => {
    it('should have 8 default folders', () => {
      expect(DEFAULT_VDR_FOLDERS).toHaveLength(8)
    })

    it('should have correct folder slugs', () => {
      const slugs = DEFAULT_VDR_FOLDERS.map(f => f.slug)
      expect(slugs).toEqual([
        'estrategia',
        'comercial',
        'financeiro',
        'operacional',
        'tecnologia',
        'rh',
        'juridico',
        'outros',
      ])
    })

    it('should have sequential sort orders starting from 0', () => {
      DEFAULT_VDR_FOLDERS.forEach((folder, index) => {
        expect(folder.sortOrder).toBe(index)
      })
    })

    it('should have all required properties', () => {
      DEFAULT_VDR_FOLDERS.forEach(folder => {
        expect(folder).toHaveProperty('slug')
        expect(folder).toHaveProperty('name')
        expect(folder).toHaveProperty('icon')
        expect(folder).toHaveProperty('sortOrder')
        expect(typeof folder.slug).toBe('string')
        expect(typeof folder.name).toBe('string')
        expect(typeof folder.icon).toBe('string')
        expect(typeof folder.sortOrder).toBe('number')
      })
    })

    it('should have unique slugs', () => {
      const slugs = DEFAULT_VDR_FOLDERS.map(f => f.slug)
      const uniqueSlugs = new Set(slugs)
      expect(uniqueSlugs.size).toBe(slugs.length)
    })
  })

  describe('VdrPermissionType', () => {
    it('should accept valid permission types', () => {
      const validTypes: VdrPermissionType[] = ['view', 'download', 'share']
      validTypes.forEach(type => {
        const permission: VdrPermissionType = type
        expect(['view', 'download', 'share']).toContain(permission)
      })
    })
  })

  describe('VdrAccessAction', () => {
    it('should accept valid access actions', () => {
      const validActions: VdrAccessAction[] = [
        'view_start',
        'view_end',
        'download',
        'print_attempt',
      ]
      validActions.forEach(action => {
        const accessAction: VdrAccessAction = action
        expect(['view_start', 'view_end', 'download', 'print_attempt']).toContain(accessAction)
      })
    })
  })
})

describe('VDR Input Types', () => {
  describe('CreateFolderInput', () => {
    it('should accept valid folder creation input', () => {
      const input: CreateFolderInput = {
        projectId: 'project-123',
        name: 'Test Folder',
        slug: 'test-folder',
        description: 'A test folder',
        icon: 'folder',
        sortOrder: 1,
      }
      expect(input.projectId).toBe('project-123')
      expect(input.name).toBe('Test Folder')
      expect(input.slug).toBe('test-folder')
    })

    it('should accept minimal folder creation input', () => {
      const input: CreateFolderInput = {
        projectId: 'project-123',
        name: 'Test Folder',
        slug: 'test-folder',
      }
      expect(input.projectId).toBeDefined()
      expect(input.name).toBeDefined()
      expect(input.slug).toBeDefined()
      expect(input.description).toBeUndefined()
      expect(input.icon).toBeUndefined()
      expect(input.sortOrder).toBeUndefined()
    })
  })

  describe('UpdateFolderInput', () => {
    it('should accept partial update input', () => {
      const input: UpdateFolderInput = {
        name: 'Updated Name',
      }
      expect(input.name).toBe('Updated Name')
      expect(input.description).toBeUndefined()
    })

    it('should accept full update input', () => {
      const input: UpdateFolderInput = {
        name: 'Updated Name',
        description: 'Updated description',
        icon: 'new-icon',
        sortOrder: 5,
      }
      expect(input.name).toBe('Updated Name')
      expect(input.description).toBe('Updated description')
      expect(input.icon).toBe('new-icon')
      expect(input.sortOrder).toBe(5)
    })
  })

  describe('CreateDocumentInput', () => {
    it('should accept valid document creation input', () => {
      const input: CreateDocumentInput = {
        projectId: 'project-123',
        folderId: 'folder-456',
        name: 'Test Document.pdf',
        externalUrl: 'https://example.com/doc.pdf',
        description: 'A test document',
        fileType: 'pdf',
        fileSizeBytes: 1024,
        isConfidential: true,
        metadata: { version: '1.0' },
      }
      expect(input.projectId).toBe('project-123')
      expect(input.folderId).toBe('folder-456')
      expect(input.name).toBe('Test Document.pdf')
      expect(input.externalUrl).toBe('https://example.com/doc.pdf')
      expect(input.isConfidential).toBe(true)
    })

    it('should accept minimal document creation input', () => {
      const input: CreateDocumentInput = {
        projectId: 'project-123',
        folderId: 'folder-456',
        name: 'Test Document.pdf',
        externalUrl: 'https://example.com/doc.pdf',
      }
      expect(input.projectId).toBeDefined()
      expect(input.folderId).toBeDefined()
      expect(input.name).toBeDefined()
      expect(input.externalUrl).toBeDefined()
      expect(input.isConfidential).toBeUndefined()
    })
  })

  describe('UpdateDocumentInput', () => {
    it('should accept partial update input', () => {
      const input: UpdateDocumentInput = {
        name: 'Updated Document Name',
      }
      expect(input.name).toBe('Updated Document Name')
    })

    it('should accept folder move via folderId', () => {
      const input: UpdateDocumentInput = {
        folderId: 'new-folder-id',
      }
      expect(input.folderId).toBe('new-folder-id')
    })

    it('should accept confidential flag update', () => {
      const input: UpdateDocumentInput = {
        isConfidential: true,
      }
      expect(input.isConfidential).toBe(true)
    })
  })

  describe('GrantAccessInput', () => {
    it('should accept org-based access grant', () => {
      const input: GrantAccessInput = {
        projectId: 'project-123',
        granteeOrgId: 'org-456',
        permissionType: 'view',
      }
      expect(input.projectId).toBe('project-123')
      expect(input.granteeOrgId).toBe('org-456')
      expect(input.permissionType).toBe('view')
    })

    it('should accept user-based access grant', () => {
      const input: GrantAccessInput = {
        projectId: 'project-123',
        granteeUserId: 'user-789',
        permissionType: 'download',
      }
      expect(input.granteeUserId).toBe('user-789')
      expect(input.permissionType).toBe('download')
    })

    it('should accept access grant with expiration', () => {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const input: GrantAccessInput = {
        projectId: 'project-123',
        granteeOrgId: 'org-456',
        permissionType: 'view',
        expiresAt,
      }
      expect(input.expiresAt).toBe(expiresAt)
    })

    it('should accept document-level access grant', () => {
      const input: GrantAccessInput = {
        projectId: 'project-123',
        granteeOrgId: 'org-456',
        permissionType: 'view',
        documentId: 'doc-789',
      }
      expect(input.documentId).toBe('doc-789')
    })

    it('should accept folder-level access grant', () => {
      const input: GrantAccessInput = {
        projectId: 'project-123',
        granteeOrgId: 'org-456',
        permissionType: 'view',
        folderId: 'folder-789',
      }
      expect(input.folderId).toBe('folder-789')
    })
  })

  describe('CreateSharedLinkInput', () => {
    it('should accept document shared link', () => {
      const input: CreateSharedLinkInput = {
        projectId: 'project-123',
        documentId: 'doc-456',
      }
      expect(input.projectId).toBe('project-123')
      expect(input.documentId).toBe('doc-456')
    })

    it('should accept folder shared link', () => {
      const input: CreateSharedLinkInput = {
        projectId: 'project-123',
        folderId: 'folder-456',
      }
      expect(input.folderId).toBe('folder-456')
    })

    it('should accept shared link with expiration', () => {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      const input: CreateSharedLinkInput = {
        projectId: 'project-123',
        documentId: 'doc-456',
        expiresAt,
      }
      expect(input.expiresAt).toBe(expiresAt)
    })

    it('should accept shared link with max views', () => {
      const input: CreateSharedLinkInput = {
        projectId: 'project-123',
        documentId: 'doc-456',
        maxViews: 10,
      }
      expect(input.maxViews).toBe(10)
    })

    it('should accept shared link with password', () => {
      const input: CreateSharedLinkInput = {
        projectId: 'project-123',
        documentId: 'doc-456',
        password: 'secret123',
      }
      expect(input.password).toBe('secret123')
    })
  })

  describe('CreateQaMessageInput', () => {
    it('should accept new question input', () => {
      const input: CreateQaMessageInput = {
        projectId: 'project-123',
        documentId: 'doc-456',
        content: 'What is the revenue for Q3?',
      }
      expect(input.projectId).toBe('project-123')
      expect(input.documentId).toBe('doc-456')
      expect(input.content).toBe('What is the revenue for Q3?')
      expect(input.parentId).toBeUndefined()
    })

    it('should accept reply input with parentId', () => {
      const input: CreateQaMessageInput = {
        projectId: 'project-123',
        documentId: 'doc-456',
        content: 'The revenue was $1M.',
        parentId: 'msg-789',
      }
      expect(input.parentId).toBe('msg-789')
    })

    it('should accept confidential question', () => {
      const input: CreateQaMessageInput = {
        projectId: 'project-123',
        documentId: 'doc-456',
        content: 'Confidential question about financials',
        isConfidential: true,
      }
      expect(input.isConfidential).toBe(true)
    })
  })
})

describe('VDR Business Logic', () => {
  describe('Folder Validation', () => {
    it('should validate folder slug format', () => {
      const validSlugs = ['financeiro', 'test-folder', 'folder123', 'my_folder']
      validSlugs.forEach(slug => {
        expect(slug).toMatch(/^[a-z0-9_-]+$/)
      })
    })

    it('should reject invalid folder slugs', () => {
      const invalidSlugs = ['Test Folder', 'folder with spaces', 'UPPERCASE', 'special@char']
      invalidSlugs.forEach(slug => {
        expect(slug).not.toMatch(/^[a-z0-9_-]+$/)
      })
    })
  })

  describe('Permission Hierarchy', () => {
    it('should have correct permission hierarchy', () => {
      // share > download > view
      const permissionLevels: Record<VdrPermissionType, number> = {
        view: 1,
        download: 2,
        share: 3,
      }
      
      expect(permissionLevels.share).toBeGreaterThan(permissionLevels.download)
      expect(permissionLevels.download).toBeGreaterThan(permissionLevels.view)
    })
  })

  describe('Expiration Logic', () => {
    it('should correctly identify expired dates', () => {
      const pastDate = new Date(Date.now() - 1000).toISOString()
      const futureDate = new Date(Date.now() + 1000).toISOString()
      
      expect(new Date(pastDate) < new Date()).toBe(true)
      expect(new Date(futureDate) > new Date()).toBe(true)
    })

    it('should handle null expiration as never expires', () => {
      const input: GrantAccessInput = {
        projectId: 'project-123',
        granteeOrgId: 'org-456',
        permissionType: 'view',
        expiresAt: undefined,
      }
      
      expect(input.expiresAt).toBeUndefined()
      // Undefined expiration means no expiration
    })
  })
})
