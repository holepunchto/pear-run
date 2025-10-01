'use strict'
/* globals Pear */
const ref = require('pear-ref')
const plink = require('pear-link')
const pear = require('pear-cmd')
const b4a = require('b4a')
const hypercoreid = require('hypercore-id-encoding')
const rundef = require('pear-cmd/run')
const { command } = require('paparam')
const { spawn } = require('child_process')
const { isElectronRenderer } = require('which-runtime')
const program = global.Bare ?? global.process

module.exports = function run (link, args = []) {
  if (isElectronRenderer) return Pear[Pear.constructor.IPC].run(link, args)
  const { RUNTIME, RUNTIME_ARGV, RTI } = Pear.constructor
  let parsed = null
  try {
    parsed = plink.parse(link)
  } catch (err) {
    if (err.info?.hostname === 'dev') return run('.' + err.info.pathname)
    throw err
  }
  const { key, fork, length } = parsed.drive
  const { key: appKey } = Pear.app.applink ? (plink.parse(Pear.app.applink)).drive : {}
  if (appKey && key && b4a.equals(key, appKey) && fork === null && length === null) {
    link = `pear://${Pear.app.fork}.${Pear.app.length}.${hypercoreid.encode(key)}${parsed.pathname || ''}`
  }
  const argv = pear(program.argv.slice(1)).rest
  const parser = command('run', ...rundef)
  const cmd = parser.parse(argv, { sync: true })
  const inject = [link]
  if (!cmd.flags.trusted) inject.unshift('--trusted')
  if (RTI.startId) inject.unshift('--parent', RTI.startId)
  if (Pear.app.key === null) inject.unshift('--base', Pear.app.dir)
  argv.length = cmd.indices.args.link
  argv.push(...inject)
  argv.unshift('run')
  let linksIndex = cmd.indices.flags.links
  const linksElements = linksIndex > 0 ? (cmd.flags.links === argv[linksIndex]) ? 2 : 1 : 0
  if (cmd.indices.flags.startId > 0) { // todo: dead code?
    argv.splice(cmd.indices.flags.startId, 1)
    if (linksIndex > cmd.indices.flags.startId) linksIndex -= linksElements
  }
  if (linksIndex > 0) argv.splice(linksIndex, linksElements)
  const sp = spawn(RUNTIME, [...RUNTIME_ARGV, ...argv, ...args], {
    stdio: ['inherit', 'inherit', 'inherit', 'overlapped'],
    windowsHide: true
  })
  ref.ref()
  sp.once('exit', (exitCode) => {
    if (exitCode !== 0) pipe.emit('crash', { exitCode })
    ref.unref()
  })
  const pipe = sp.stdio[3]
  pipe.on('end', () => pipe.end())
  return pipe
}
