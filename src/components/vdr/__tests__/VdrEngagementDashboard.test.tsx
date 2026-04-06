/**
 * Tests for VdrEngagementDashboard
 * Phase 4 - Validation & QA: A1-A6
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VdrEngagementDashboard } from '../VdrEngagementDashboard'

const mockGetEngagement = jest.fn()
const mockGetFolderInterest = jest.fn()
const mockGetAccessTimeline = jest.fn()
const mockGetActivityAlerts = jest.fn()
const mockGetFolderCompleteness = jest.fn()
const mockExportReport = jest.fn()

jest.mock('@/lib/actions/vdr', () => ({
  getEngagementByInvestor: (...args: unknown[]) => mockGetEngagement(...args),
  getFolderInterest: (...args: unknown[]) => mockGetFolderInterest(...args),
  getAccessTimeline: (...args: unknown[]) => mockGetAccessTimeline(...args),
  getActivityAlerts: (...args: unknown[]) => mockGetActivityAlerts(...args),
  getFolderCompleteness: (...args: unknown[]) => mockGetFolderCompleteness(...args),
  exportEngagementReport: (...args: unknown[]) => mockExportReport(...args),
}))

jest.mock('sonner', () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}))

beforeEach(() => {
  jest.clearAllMocks()
  mockGetEngagement.mockResolvedValue({ success: true, data: [] })
  mockGetFolderInterest.mockResolvedValue({ success: true, data: [] })
  mockGetAccessTimeline.mockResolvedValue({ success: true, data: [] })
  mockGetActivityAlerts.mockResolvedValue({ success: true, data: [] })
  mockGetFolderCompleteness.mockResolvedValue({ success: true, data: [] })
})

describe('VdrEngagementDashboard', () => {
  it('A5 - exibe loading state inicial', () => {
    mockGetEngagement.mockImplementation(() => new Promise(() => {}))
    render(<VdrEngagementDashboard projectId="proj-1" />)
    expect(screen.getByText('Engajamento por Investidor')).toBeInTheDocument()
  })

  it('A4 - exibe empty state quando não há dados', async () => {
    render(<VdrEngagementDashboard projectId="proj-1" />)
    await waitFor(() => {
      expect(mockGetEngagement).toHaveBeenCalledWith('proj-1', '30d')
    })
    await waitFor(() => {
      expect(screen.getByText('Nenhum dado de engajamento disponível ainda.')).toBeInTheDocument()
    })
  })

  it('A1 - renderiza ranking com dados', async () => {
    mockGetEngagement.mockResolvedValue({
      success: true,
      data: [
        {
          organizationId: 'org-1',
          organizationName: 'Investidor A',
          organizationSlug: 'investidor-a',
          totalViews: 10,
          totalDurationSeconds: 300,
          uniqueDocuments: 3,
          lastAccessAt: '2026-02-15T10:00:00Z',
        },
      ],
    })
    mockGetFolderInterest.mockResolvedValue({ success: true, data: [] })
    mockGetAccessTimeline.mockResolvedValue({ success: true, data: [] })
    mockGetActivityAlerts.mockResolvedValue({ success: true, data: [] })
    mockGetFolderCompleteness.mockResolvedValue({ success: true, data: [] })

    render(<VdrEngagementDashboard projectId="proj-1" />)
    await waitFor(() => {
      expect(screen.getByText('Investidor A')).toBeInTheDocument()
    })
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('A2 - renderiza interesse por pasta', async () => {
    mockGetEngagement.mockResolvedValue({
      success: true,
      data: [{
        organizationId: 'org-1',
        organizationName: 'Investidor A',
        organizationSlug: 'inv-a',
        totalViews: 1,
        totalDurationSeconds: 0,
        uniqueDocuments: 0,
        lastAccessAt: null,
      }],
    })
    mockGetFolderInterest.mockResolvedValue({
      success: true,
      data: [
        {
          folderId: 'f1',
          folderName: 'Financeiro',
          views: 5,
          accessedDocuments: 2,
          totalDurationSeconds: 120,
        },
      ],
    })
    mockGetAccessTimeline.mockResolvedValue({ success: true, data: [] })
    mockGetActivityAlerts.mockResolvedValue({ success: true, data: [] })
    mockGetFolderCompleteness.mockResolvedValue({ success: true, data: [] })

    render(<VdrEngagementDashboard projectId="proj-1" />)
    await waitFor(() => {
      expect(mockGetFolderInterest).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /pastas/i })).toBeInTheDocument()
    })
    await userEvent.click(screen.getByRole('tab', { name: /pastas/i }))
    await waitFor(() => {
      expect(screen.getByText('Financeiro')).toBeInTheDocument()
    })
  })

  it('A6 - erro de API não quebra o componente', async () => {
    mockGetEngagement.mockResolvedValue({ success: false, error: 'Erro de rede' })
    render(<VdrEngagementDashboard projectId="proj-1" />)
    await waitFor(() => {
      expect(mockGetEngagement).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(screen.getByText('Nenhum dado de engajamento disponível ainda.')).toBeInTheDocument()
    })
  })
})
