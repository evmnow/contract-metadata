import Ajv, { type ErrorObject } from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, basename } from 'path'

interface ContractData {
  address?: string
  includes?: string[]
  groups?: Record<string, unknown>
  functions?: Record<string, FunctionEntry>
  events?: Record<string, unknown>
  errors?: Record<string, unknown>
}

interface FunctionEntry {
  group?: string
  related?: string[]
}

const ajv = new Ajv({ strict: false, allErrors: true })
addFormats(ajv)

const contractSchema = JSON.parse(readFileSync('schema/contract-metadata.schema.json', 'utf8'))
const interfaceSchema = JSON.parse(readFileSync('schema/interface.schema.json', 'utf8'))

ajv.addSchema(contractSchema, 'contract-metadata.schema.json')
const validateContract = ajv.compile(contractSchema)
const validateInterface = ajv.compile(interfaceSchema)

// Valid key formats for functions/events/errors
const SELECTOR_4BYTE = /^0x[0-9a-f]{8}$/
const SELECTOR_32BYTE = /^0x[0-9a-f]{64}$/
const SIGNATURE_RE = /^[a-zA-Z_][a-zA-Z0-9_]*\(.*\)$/

const args = process.argv.slice(2)
const runContracts = args.length === 0 || args.includes('--contracts')
const runInterfaces = args.length === 0 || args.includes('--interfaces')

let hasErrors = false

if (runContracts && existsSync('contracts')) {
  const contractDir = 'contracts'
  const files = readdirSync(contractDir).filter(f => f.endsWith('.json'))

  for (const file of files) {
    const path = join(contractDir, file)
    const data: ContractData = JSON.parse(readFileSync(path, 'utf8'))
    const valid = validateContract(data)

    if (valid) {
      console.log(`  \x1b[32m✓\x1b[0m ${path}`)
    } else {
      hasErrors = true
      console.log(`  \x1b[31m✗\x1b[0m ${path}`)
      for (const err of validateContract.errors as ErrorObject[]) {
        console.log(`    ${err.instancePath || '/'} ${err.message}`)
      }
    }

    // Additional semantic checks
    const warnings = semanticChecks(data, path)
    for (const w of warnings) {
      console.log(`    \x1b[33m⚠\x1b[0m ${w}`)
    }
  }
}

if (runInterfaces && existsSync('schema/interfaces')) {
  const interfaceDir = 'schema/interfaces'
  const files = readdirSync(interfaceDir).filter(f => f.endsWith('.json'))

  for (const file of files) {
    const path = join(interfaceDir, file)
    const data = JSON.parse(readFileSync(path, 'utf8'))
    const valid = validateInterface(data)

    if (valid) {
      console.log(`  \x1b[32m✓\x1b[0m ${path}`)
    } else {
      hasErrors = true
      console.log(`  \x1b[31m✗\x1b[0m ${path}`)
      for (const err of validateInterface.errors as ErrorObject[]) {
        console.log(`    ${err.instancePath || '/'} ${err.message}`)
      }
    }
  }
}

if (hasErrors) {
  console.log('\n\x1b[31mValidation failed.\x1b[0m')
  process.exit(1)
} else {
  console.log('\n\x1b[32mAll files valid.\x1b[0m')
}

function extractName(key: string): string {
  if (SIGNATURE_RE.test(key)) return key.slice(0, key.indexOf('('))
  return key
}

function functionKeysMatch(ref: string, keys: Set<string>): boolean {
  // Direct match
  if (keys.has(ref)) return true
  // ref is a bare name — check if any signature key starts with that name
  if (!SELECTOR_4BYTE.test(ref) && !SIGNATURE_RE.test(ref)) {
    for (const k of keys) {
      if (extractName(k) === ref) return true
    }
  }
  return false
}

function semanticChecks(data: ContractData, path: string): string[] {
  const warnings: string[] = []
  const groups = data.groups ? Object.keys(data.groups) : []

  // Check function key formats and group/related references
  if (data.functions) {
    const fnKeys = new Set(Object.keys(data.functions))
    for (const [key, fn] of Object.entries(data.functions)) {
      // Validate key format
      if (!SELECTOR_4BYTE.test(key) && !SIGNATURE_RE.test(key) && /[^a-zA-Z0-9_]/.test(key)) {
        warnings.push(`functions key "${key}" is not a valid name, signature, or 4-byte selector`)
      }

      if (fn.group && groups.length > 0 && !groups.includes(fn.group)) {
        warnings.push(`functions.${key}.group "${fn.group}" not found in groups`)
      }
      // Check related references
      if (fn.related) {
        for (const ref of fn.related) {
          if (!functionKeysMatch(ref, fnKeys)) {
            warnings.push(`functions.${key}.related references unknown function "${ref}"`)
          }
        }
      }
    }
  }

  // Check event key formats
  if (data.events) {
    for (const key of Object.keys(data.events)) {
      if (!SELECTOR_32BYTE.test(key) && !SIGNATURE_RE.test(key) && /[^a-zA-Z0-9_]/.test(key)) {
        warnings.push(`events key "${key}" is not a valid name, signature, or 32-byte topic hash`)
      }
    }
  }

  // Check error key formats
  if (data.errors) {
    for (const key of Object.keys(data.errors)) {
      if (!SELECTOR_4BYTE.test(key) && !SIGNATURE_RE.test(key) && /[^a-zA-Z0-9_]/.test(key)) {
        warnings.push(`errors key "${key}" is not a valid name, signature, or 4-byte selector`)
      }
    }
  }

  // Check includes references
  if (data.includes) {
    for (const ref of data.includes) {
      if (ref.startsWith('interface:')) {
        const name = ref.slice('interface:'.length)
        if (!existsSync(join('schema', 'interfaces', `${name}.json`))) {
          warnings.push(`includes references unknown interface "${ref}"`)
        }
      }
    }
  }

  // Check address matches filename
  if (data.address) {
    const expected = basename(path, '.json')
    if (data.address !== expected) {
      warnings.push(`address "${data.address}" does not match filename "${expected}"`)
    }
  }

  return warnings
}
