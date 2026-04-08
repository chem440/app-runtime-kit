#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

const PROFILE_FILE = path.join(process.cwd(), 'profiles', 'defaults.json')
const OUTPUT_DIR = path.join(process.cwd(), '.runtime-kit')
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'standalone.config.json')

function parseArgs(argv) {
  const parsed = {}
  for (const token of argv) {
    if (!token.startsWith('--')) continue
    const [key, value] = token.slice(2).split('=')
    parsed[key] = value ?? 'true'
  }
  return parsed
}

async function loadProfile() {
  const raw = await fs.readFile(PROFILE_FILE, 'utf8')
  return JSON.parse(raw)
}

async function exists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const force = args.force === 'true'

  const profile = await loadProfile()
  const present = await exists(OUTPUT_FILE)

  if (present && !force) {
    console.log(`[setup-standalone] Existing config found at ${OUTPUT_FILE}`)
    console.log('[setup-standalone] No changes made. Re-run with --force=true to overwrite.')
    return
  }

  const generated = {
    generatedAt: new Date().toISOString(),
    profile: profile.profileId,
    description: profile.description,
    defaults: {
      cache: profile.cache,
      telemetry: profile.telemetry,
      services: profile.services,
    },
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true })
  await fs.writeFile(OUTPUT_FILE, `${JSON.stringify(generated, null, 2)}\n`, 'utf8')

  console.log('[setup-standalone] Standalone config initialized.')
  console.log(`[setup-standalone] Wrote: ${OUTPUT_FILE}`)
}

main().catch((error) => {
  console.error(`[setup-standalone] Failed: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
