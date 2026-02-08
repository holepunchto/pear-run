const Worker = require('bare-worker')
const linkmapper = require('pear-links-map') // will be transformed in bundler to require the actual file
const b4a = require('b4a')

module.exports = (link, args = [], data = {}) => {
  console.log('running worker:', link)
  const key = link
  if (typeof link === 'string' && link.startsWith('pear://')) {
    link = linkmapper[key]?.resolved
    if (!link)
      throw new Error(`Could not find bundle for '${key}' in pear-links-map`)
  }
  // need to pass args to preload as well as link and worker pkg to set up Pear global
  const pkgContent = linkmapper[key]?.pkgContent
  const info = {pkgContent, link: key}
  Worker.preload(require.resolve('pear-api'))
  const worker = new Worker(link, { workerData: { info ,data, args } })
  worker.write = (message) => worker.postMessage(b4a.from(message))
  worker.on('message', (message) => worker.emit('data', message))

  return worker
}
