#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const distRoot = join(process.cwd(), 'dist')

function walkJsFiles(dir) {
  const entries = readdirSync(dir)
  const files = []
  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      files.push(...walkJsFiles(fullPath))
      continue
    }
    if (fullPath.endsWith('.js')) {
      files.push(fullPath)
    }
  }
  return files
}

function hasKnownExtension(path) {
  return path.endsWith('.js') || path.endsWith('.mjs') || path.endsWith('.cjs') || path.endsWith('.json')
}

function resolveUpdatedSpecifier(filePath, specifier) {
  if (hasKnownExtension(specifier)) return specifier

  const baseDir = dirname(filePath)
  const resolvedTarget = resolve(baseDir, specifier)
  const asFile = `${resolvedTarget}.js`
  if (existsSync(asFile)) {
    return `${specifier}.js`
  }

  const asIndex = join(resolvedTarget, 'index.js')
  if (existsSync(asIndex)) {
    return `${specifier}/index.js`
  }

  return `${specifier}.js`
}

const importSpecifierRegex = /(from\s+['"])(\.{1,2}\/[^'"]+)(['"])/g
const dynamicImportRegex = /(import\(\s*['"])(\.{1,2}\/[^'"]+)(['"]\s*\))/g

let filesTouched = 0
let replacements = 0

for (const filePath of walkJsFiles(distRoot)) {
  const original = readFileSync(filePath, 'utf8')
  let updated = original

  updated = updated.replace(importSpecifierRegex, (match, prefix, specifier, suffix) => {
    const nextSpecifier = resolveUpdatedSpecifier(filePath, specifier)
    if (nextSpecifier === specifier) return match
    replacements += 1
    return `${prefix}${nextSpecifier}${suffix}`
  })

  updated = updated.replace(dynamicImportRegex, (match, prefix, specifier, suffix) => {
    const nextSpecifier = resolveUpdatedSpecifier(filePath, specifier)
    if (nextSpecifier === specifier) return match
    replacements += 1
    return `${prefix}${nextSpecifier}${suffix}`
  })

  if (updated !== original) {
    writeFileSync(filePath, updated, 'utf8')
    filesTouched += 1
  }
}

console.log(`[fix-dist-import-extensions] updated ${filesTouched} file(s), ${replacements} import specifier(s)`)
