const Worker = require('bare-worker')
const linkmapper = require('pear-links-map') // will be transformed in bundler to require the actual file
const b4a = require('b4a')

module.exports = (link, args= [], data = {}) => {
  console.log('running worker:', link)
  if (typeof link === 'string' && link.startsWith('pear://')) {
    const key = link
    link = linkmapper[link]?.resolved
    if (!link)
      throw new Error(`Could not find bundle for '${key}' in pear-links-map`)
  }
  Worker.preload(require.resolve('pear-api'))
  const worker = new Worker(link, {
    data: { ...args, ...data }
  })
  worker.write = (message) => worker.postMessage(b4a.from(message))
  worker.on('message', (message) => worker.emit('data', message))

  return worker
}
