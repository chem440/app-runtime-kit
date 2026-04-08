#!/usr/bin/env node

import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const version = pkg.version
const refType = process.env.GITHUB_REF_TYPE
const refName = process.env.GITHUB_REF_NAME
const expectedTag = `v${version}`

function fail(message) {
  console.error(`[verify-release-tag] FAIL ${message}`)
  process.exit(1)
}

if (!version || typeof version !== 'string') {
  fail('package.json version is missing or invalid')
}

if (refType !== 'tag') {
  fail(`expected tag context (GITHUB_REF_TYPE=tag), got "${refType ?? 'undefined'}"`)
}

if (!refName) {
  fail('GITHUB_REF_NAME is missing')
}

if (refName !== expectedTag) {
  fail(`tag/version mismatch: expected ${expectedTag}, got ${refName}`)
}

console.log(`[verify-release-tag] OK tag ${refName} matches package version ${version}`)
