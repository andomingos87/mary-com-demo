#!/usr/bin/env node

/**
 * Bundle Size Checker Script
 * 
 * This script checks the size of the Next.js build output and compares it
 * against defined thresholds. Use it in CI/CD pipelines to prevent
 * bundle size regressions.
 * 
 * Usage:
 *   npm run build
 *   node scripts/check-bundle-size.js
 */

const fs = require('fs')
const path = require('path')

// Bundle size thresholds (in KB)
const THRESHOLDS = {
  // First Load JS for shared chunks
  sharedFirstLoadJS: 120, // KB
  // Individual page threshold
  pageFirstLoadJS: 150, // KB
  // Total CSS
  totalCSS: 50, // KB
}

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
}

function parseKB(sizeStr) {
  const match = sizeStr.match(/([\d.]+)\s*(KB|kB|MB|B)/i)
  if (!match) return 0
  
  const value = parseFloat(match[1])
  const unit = match[2].toUpperCase()
  
  switch (unit) {
    case 'B':
      return value / 1024
    case 'KB':
      return value
    case 'MB':
      return value * 1024
    default:
      return value
  }
}

function checkBuildOutput() {
  const buildManifestPath = path.join(process.cwd(), '.next', 'build-manifest.json')
  const appBuildManifestPath = path.join(process.cwd(), '.next', 'app-build-manifest.json')
  
  console.log(`\n${colors.cyan}📊 Bundle Size Analysis${colors.reset}\n`)
  console.log('=' .repeat(60))
  
  let hasIssues = false
  const results = []
  
  // Check if .next folder exists
  if (!fs.existsSync(path.join(process.cwd(), '.next'))) {
    console.log(`${colors.red}❌ Build folder (.next) not found.${colors.reset}`)
    console.log('   Run "npm run build" first.\n')
    process.exit(1)
  }
  
  // Get static files info
  const staticDir = path.join(process.cwd(), '.next', 'static')
  let totalJSSize = 0
  let totalCSSSize = 0
  
  if (fs.existsSync(staticDir)) {
    const walkDir = (dir, callback) => {
      if (!fs.existsSync(dir)) return
      const files = fs.readdirSync(dir)
      files.forEach(file => {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)
        if (stat.isDirectory()) {
          walkDir(filePath, callback)
        } else {
          callback(filePath, stat.size)
        }
      })
    }
    
    walkDir(staticDir, (filePath, size) => {
      if (filePath.endsWith('.js')) {
        totalJSSize += size
      } else if (filePath.endsWith('.css')) {
        totalCSSSize += size
      }
    })
  }
  
  // Report JS Size
  const jsKB = totalJSSize / 1024
  const jsStatus = jsKB < THRESHOLDS.sharedFirstLoadJS ? '✅' : '⚠️'
  const jsColor = jsKB < THRESHOLDS.sharedFirstLoadJS ? colors.green : colors.yellow
  
  results.push({
    name: 'Total JS',
    size: jsKB,
    threshold: THRESHOLDS.sharedFirstLoadJS,
    status: jsKB < THRESHOLDS.sharedFirstLoadJS
  })
  
  console.log(`${jsStatus} Total JS: ${jsColor}${jsKB.toFixed(2)} KB${colors.reset} (threshold: ${THRESHOLDS.sharedFirstLoadJS} KB)`)
  
  if (jsKB >= THRESHOLDS.sharedFirstLoadJS) {
    hasIssues = true
  }
  
  // Report CSS Size
  const cssKB = totalCSSSize / 1024
  const cssStatus = cssKB < THRESHOLDS.totalCSS ? '✅' : '⚠️'
  const cssColor = cssKB < THRESHOLDS.totalCSS ? colors.green : colors.yellow
  
  results.push({
    name: 'Total CSS',
    size: cssKB,
    threshold: THRESHOLDS.totalCSS,
    status: cssKB < THRESHOLDS.totalCSS
  })
  
  console.log(`${cssStatus} Total CSS: ${cssColor}${cssKB.toFixed(2)} KB${colors.reset} (threshold: ${THRESHOLDS.totalCSS} KB)`)
  
  if (cssKB >= THRESHOLDS.totalCSS) {
    hasIssues = true
  }
  
  console.log('\n' + '=' .repeat(60))
  
  // Summary
  if (hasIssues) {
    console.log(`\n${colors.yellow}⚠️  Some bundle sizes exceed thresholds.${colors.reset}`)
    console.log('   Consider code splitting or removing unused dependencies.\n')
    
    // Don't fail the build, just warn
    // process.exit(1)
  } else {
    console.log(`\n${colors.green}✅ All bundle sizes within thresholds!${colors.reset}\n`)
  }
  
  // Output JSON report for CI
  const reportPath = path.join(process.cwd(), '.next', 'bundle-report.json')
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    thresholds: THRESHOLDS,
    results,
    passed: !hasIssues
  }, null, 2))
  
  console.log(`📄 Report saved to: ${reportPath}\n`)
  
  return !hasIssues
}

// Run check
checkBuildOutput()

