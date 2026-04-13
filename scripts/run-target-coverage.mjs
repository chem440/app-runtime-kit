import { spawnSync } from 'node:child_process'
import path from 'node:path'

const targets = process.argv.slice(2)

if (targets.length === 0) {
  console.error('[coverage-target] Missing test target.')
  console.error('Usage: npm run test:coverage:target -- <test-file-or-pattern> [more-patterns]')
  process.exit(1)
}

function toSlug(values) {
  const raw = values.join('-')
  return raw
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'target'
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
const slug = toSlug(targets)
const reportsDir = path.posix.join('coverage', 'targets', `${slug}-${timestamp}`)

const args = [
  'vitest',
  'run',
  ...targets,
  '--coverage',
  '--coverage.all=false',
  '--coverage.provider=v8',
  '--coverage.reporter=text',
  '--coverage.reporter=json-summary',
  '--coverage.reporter=lcov',
  '--coverage.reporter=html',
  '--coverage.thresholds.lines=0',
  '--coverage.thresholds.statements=0',
  '--coverage.thresholds.branches=0',
  '--coverage.thresholds.functions=0',
  `--coverage.reportsDirectory=${reportsDir}`,
]

console.log(`[coverage-target] Running: npx ${args.join(' ')}`)
const result = spawnSync('npx', args, {
  stdio: 'inherit',
  env: process.env,
})

if (result.error) {
  console.error(`[coverage-target] Failed to start: ${result.error.message}`)
  process.exit(1)
}

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}

console.log(`[coverage-target] Report written to ${reportsDir}`)
console.log(`[coverage-target] Summary JSON: ${path.posix.join(reportsDir, 'coverage-summary.json')}`)
