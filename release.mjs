import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

// eslint-disable-next-line node/prefer-global/process
const version = process.argv[2]

if (!version)
  throw new Error('Usage: pnpm release <version>')

const run = cmd => execSync(cmd, { stdio: 'inherit' })
const runOutput = cmd => execSync(cmd, { encoding: 'utf-8' }).trim()

const existingTags = runOutput('git tag --list')
if (existingTags.split('\n').includes(`v${version}`))
  throw new Error(`Tag v${version} already exists`)

// 1. Bump version in package.json only (skip if already at target version)
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))
if (pkg.version !== version)
  run(`pnpm version ${version} --no-git-tag-version`)

const { version: v } = JSON.parse(readFileSync('./package.json', 'utf-8'))
const tag = `v${v}`

// 2. Commit + tag so conventional-changelog can group commits under this version
run('git add package.json')
run(`git commit -m "chore(release): bump version to ${v}"`)
run(`git tag -a ${tag} -m ${tag}`)

// 3. Generate changelog (tag exists, correct version section is created)
run('pnpm exec conventional-changelog -n ./changelog.config.mjs -i CHANGELOG.md -s -r 0')

// 4. Amend version commit to include CHANGELOG.md and move tag to it
run('git add CHANGELOG.md')
run('git commit --amend --no-edit')
run(`git tag -f ${tag}`)

// 5. Push branch and tag
run('git push')
run(`git push origin ${tag}`)
