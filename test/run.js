'use strict'
// rigging substitute for "pear run" (allows for bare run ....)
if (global.Bare.argv.some((arg) => arg === '--trusted') === false)
  throw new Error('--trusted flag expected')
require(
  global.Bare.argv.find((arg) => arg.includes('fixtures')) ||
    './fixtures/argv.js'
)
