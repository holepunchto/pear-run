'use strict'
/* globals Pear */
const ref = require('pear-ref')
const plink = require('pear-link')
const pear = require('pear-cmd')
const b4a = require('b4a')
const rundef = require('pear-cmd/run')
const { command } = require('paparam')
const { spawn } = require('child_process')
const { pathToFileURL, fileURLToPath } = require('url-file-url')
const path = require('path')
const { ERR_NOT_FOUND, ERR_INVALID_INPUT } = require('pear-errors')
const { isElectronRenderer } = require('which-runtime')
const unixpathresolve = require('unix-path-resolve')
const program = global.Bare ?? global.process

let check
module.exports = function run(link, args = []) {
  const isPear = link.startsWith('pear://')
  const isFile = link.startsWith('file://')
  const isAbsolute = !isFile && path.isAbsolute(link)

  const app = Pear.app ?? Pear.config // note: legacy, remove in future
  if (!isFile && !isAbsolute && !isPear) {
    if (app.options.workers === undefined) throw new Error('workers undefined')
    const worker = app.options.workers[link]
    if (typeof worker !== 'string')
      throw new Error(`worker "${link}" not found`)
    const workerLink = app.applink.startsWith('pear://')
      ? app.applink + worker
      : pathToFileURL(
          path.join(fileURLToPath(app.applink), worker.slice(1))
        ).href.replaceAll('%23', '#')
    check = 1
    return run(workerLink, args)
  }
  if (isPear && check !== 1) throw ERR_INVALID_INPUT('pear links not supported')

  const { RUNTIME, RUNTIME_ARGV, RTI, RUNTIME_FLAGS = [] } = Pear.constructor
  let parsed = null
  try {
    parsed = plink.parse(link)
  } catch (err) {
    if (err.info?.hostname === 'dev')
      return run(path.resolve('.' + err.info.pathname))
    throw err
  }
  const { key, fork, length } = parsed.drive

  const applink = plink.parse(app.applink)
  const { key: appKey } = applink.drive
  if (
    appKey &&
    key &&
    b4a.equals(key, appKey) &&
    fork === null &&
    length === null
  ) {
    link = plink.serialize({
      ...parsed,
      drive: { ...parsed.drive, length: app.length, fork: app.fork }
    })
  }

  if (isElectronRenderer) {
    if (typeof Pear[Pear.constructor.IPC]?.run === 'function') {
      return Pear[Pear.constructor.IPC].run(link, args)
    } else {
      return Pear.worker.run(link, args)
    }
  }

  if (!isFile) {
    unixpathresolve('/', link) // throw if escaping root
    if (isAbsolute) link = pathToFileURL(link).href.replaceAll('%23', '#')
    else if (!isPear) throw ERR_NOT_FOUND('not found (path must be absolute)')
  }

  const argv = pear(program.argv.slice(1)).rest
  const parser = command('run', ...rundef)
  const cmd = parser.parse(argv, { sync: true })
  const inject = ['--no-pre', link]
  if (!cmd.flags.trusted) inject.unshift('--trusted')
  if (RTI.startId) inject.unshift('--parent', RTI.startId)
  if (
    app.key === null &&
    !isFile &&
    (!isAbsolute || link.startsWith(app.applink + '/'))
  ) {
    inject.unshift('--base', app.dir)
  }
  argv.length = cmd.indices.args.link
  argv.push(...inject)
  let linksIndex = cmd.indices.flags.links
  const linksElements =
    linksIndex > 0 ? (cmd.flags.links === argv[linksIndex] ? 2 : 1) : 0
  if (cmd.indices.flags.startId > 0) {
    // todo: dead code?
    argv.splice(cmd.indices.flags.startId, 1)
    if (linksIndex > cmd.indices.flags.startId) linksIndex -= linksElements
  }
  if (linksIndex > 0) argv.splice(linksIndex, linksElements)
  const sp = spawn(
    RUNTIME,
    [...RUNTIME_ARGV, 'run', ...RUNTIME_FLAGS, ...argv, ...args],
    {
      stdio: ['inherit', 'inherit', 'inherit', 'overlapped'],
      windowsHide: true
    }
  )
  ref.ref()
  sp.once('exit', (exitCode) => {
    if (exitCode !== 0) pipe.emit('crash', { exitCode })
    ref.unref()
  })
  const pipe = sp.stdio[3]
  pipe.on('end', () => pipe.end())
  return pipe
}
