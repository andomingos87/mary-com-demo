/**
 * Tests for FileTypeIcon component and utilities
 * Phase 4 - Validation & QA for VDR Fase 1
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { FileTypeIcon, getFileTypeConfig, getFileTypeLabel } from '../FileTypeIcon'

describe('FileTypeIcon', () => {
  describe('getFileTypeConfig', () => {
    describe('PDF files', () => {
      it('should return PDF config for .pdf extension', () => {
        const config = getFileTypeConfig('pdf')
        expect(config.label).toBe('PDF')
        expect(config.color).toBe('text-red-600')
      })

      it('should extract extension from URL', () => {
        const config = getFileTypeConfig('https://example.com/document.pdf')
        expect(config.label).toBe('PDF')
      })

      it('should extract extension from path', () => {
        const config = getFileTypeConfig('/path/to/file.pdf')
        expect(config.label).toBe('PDF')
      })
    })

    describe('Word documents', () => {
      it('should return Word config for .doc extension', () => {
        const config = getFileTypeConfig('doc')
        expect(config.label).toBe('Word')
        expect(config.color).toBe('text-blue-600')
      })

      it('should return Word config for .docx extension', () => {
        const config = getFileTypeConfig('docx')
        expect(config.label).toBe('Word')
      })
    })

    describe('Excel/Spreadsheets', () => {
      it('should return Excel config for .xls extension', () => {
        const config = getFileTypeConfig('xls')
        expect(config.label).toBe('Excel')
        expect(config.color).toBe('text-green-600')
      })

      it('should return Excel config for .xlsx extension', () => {
        const config = getFileTypeConfig('xlsx')
        expect(config.label).toBe('Excel')
      })

      it('should return CSV config for .csv extension', () => {
        const config = getFileTypeConfig('csv')
        expect(config.label).toBe('CSV')
        expect(config.color).toBe('text-green-600')
      })
    })

    describe('PowerPoint', () => {
      it('should return PowerPoint config for .ppt extension', () => {
        const config = getFileTypeConfig('ppt')
        expect(config.label).toBe('PowerPoint')
        expect(config.color).toBe('text-orange-600')
      })

      it('should return PowerPoint config for .pptx extension', () => {
        const config = getFileTypeConfig('pptx')
        expect(config.label).toBe('PowerPoint')
      })
    })

    describe('Images', () => {
      const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']

      imageExtensions.forEach(ext => {
        it(`should return Image config for .${ext} extension`, () => {
          const config = getFileTypeConfig(ext)
          expect(config.label).toBe('Imagem')
          expect(config.color).toBe('text-purple-600')
        })
      })
    })

    describe('Video', () => {
      const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm']

      videoExtensions.forEach(ext => {
        it(`should return Video config for .${ext} extension`, () => {
          const config = getFileTypeConfig(ext)
          expect(config.label).toBe('Vídeo')
          expect(config.color).toBe('text-pink-600')
        })
      })
    })

    describe('Audio', () => {
      const audioExtensions = ['mp3', 'wav', 'ogg']

      audioExtensions.forEach(ext => {
        it(`should return Audio config for .${ext} extension`, () => {
          const config = getFileTypeConfig(ext)
          expect(config.label).toBe('Áudio')
          expect(config.color).toBe('text-cyan-600')
        })
      })
    })

    describe('Archives', () => {
      const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz']

      archiveExtensions.forEach(ext => {
        it(`should return Archive config for .${ext} extension`, () => {
          const config = getFileTypeConfig(ext)
          expect(config.label).toBe('Arquivo')
          expect(config.color).toBe('text-amber-600')
        })
      })
    })

    describe('Code/Text files', () => {
      it('should return JSON config for .json extension', () => {
        const config = getFileTypeConfig('json')
        expect(config.label).toBe('JSON')
        expect(config.color).toBe('text-slate-600')
      })

      it('should return XML config for .xml extension', () => {
        const config = getFileTypeConfig('xml')
        expect(config.label).toBe('XML')
      })

      it('should return HTML config for .html extension', () => {
        const config = getFileTypeConfig('html')
        expect(config.label).toBe('HTML')
      })

      it('should return Text config for .txt extension', () => {
        const config = getFileTypeConfig('txt')
        expect(config.label).toBe('Texto')
      })
    })

    describe('Unknown/Default', () => {
      it('should return default config for unknown extension', () => {
        const config = getFileTypeConfig('xyz')
        expect(config.label).toBe('Arquivo')
        expect(config.color).toBe('text-gray-500')
      })

      it('should return default config for null input', () => {
        const config = getFileTypeConfig(null)
        expect(config.label).toBe('Arquivo')
      })

      it('should return default config for undefined input', () => {
        const config = getFileTypeConfig(undefined)
        expect(config.label).toBe('Arquivo')
      })

      it('should return default config for empty string', () => {
        const config = getFileTypeConfig('')
        expect(config.label).toBe('Arquivo')
      })
    })

    describe('Case insensitivity', () => {
      it('should handle uppercase extensions', () => {
        const config = getFileTypeConfig('PDF')
        expect(config.label).toBe('PDF')
      })

      it('should handle mixed case extensions', () => {
        const config = getFileTypeConfig('PdF')
        expect(config.label).toBe('PDF')
      })

      it('should handle uppercase in URL', () => {
        const config = getFileTypeConfig('https://example.com/FILE.PDF')
        expect(config.label).toBe('PDF')
      })
    })

    describe('URL parsing', () => {
      it('should extract extension from full URL with query params', () => {
        const config = getFileTypeConfig('https://example.com/doc.pdf?token=abc123')
        expect(config.label).toBe('PDF')
      })

      it('should extract extension from URL with hash', () => {
        const config = getFileTypeConfig('https://example.com/doc.pdf#page=1')
        expect(config.label).toBe('PDF')
      })

      it('should handle URL without extension', () => {
        const config = getFileTypeConfig('https://example.com/document')
        expect(config.label).toBe('Arquivo')
      })
    })
  })

  describe('getFileTypeLabel', () => {
    it('should return correct label for PDF', () => {
      expect(getFileTypeLabel('pdf')).toBe('PDF')
    })

    it('should return correct label for Word', () => {
      expect(getFileTypeLabel('docx')).toBe('Word')
    })

    it('should return correct label for Excel', () => {
      expect(getFileTypeLabel('xlsx')).toBe('Excel')
    })

    it('should return default label for unknown type', () => {
      expect(getFileTypeLabel('unknown')).toBe('Arquivo')
    })

    it('should return default label for null', () => {
      expect(getFileTypeLabel(null)).toBe('Arquivo')
    })
  })

  describe('FileTypeIcon component', () => {
    it('should render without crashing', () => {
      render(<FileTypeIcon fileType="pdf" />)
      // Component should render without throwing
    })

    it('should render with background by default', () => {
      const { container } = render(<FileTypeIcon fileType="pdf" />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.tagName).toBe('DIV')
      expect(wrapper.className).toContain('rounded-md')
    })

    it('should render without background when showBackground is false', () => {
      const { container } = render(<FileTypeIcon fileType="pdf" showBackground={false} />)
      const element = container.firstChild as HTMLElement
      expect(element.tagName).toBe('svg')
    })

    it('should apply size classes correctly', () => {
      const { container: smContainer } = render(<FileTypeIcon fileType="pdf" size="sm" />)
      const { container: lgContainer } = render(<FileTypeIcon fileType="pdf" size="lg" />)
      
      const smWrapper = smContainer.firstChild as HTMLElement
      const lgWrapper = lgContainer.firstChild as HTMLElement
      
      expect(smWrapper.className).toContain('p-1.5')
      expect(lgWrapper.className).toContain('p-2.5')
    })

    it('should apply custom className', () => {
      const { container } = render(<FileTypeIcon fileType="pdf" className="custom-class" />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('custom-class')
    })

    it('should apply correct color for PDF', () => {
      const { container } = render(<FileTypeIcon fileType="pdf" />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('bg-red-100')
    })

    it('should apply correct color for Excel', () => {
      const { container } = render(<FileTypeIcon fileType="xlsx" />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('bg-green-100')
    })

    it('should apply correct color for Word', () => {
      const { container } = render(<FileTypeIcon fileType="docx" />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('bg-blue-100')
    })

    it('should apply correct color for images', () => {
      const { container } = render(<FileTypeIcon fileType="png" />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('bg-purple-100')
    })

    it('should apply default color for unknown type', () => {
      const { container } = render(<FileTypeIcon fileType="unknown" />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('bg-gray-100')
    })
  })
})
