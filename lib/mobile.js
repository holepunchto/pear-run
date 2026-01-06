const Pipe = require('bare-pipe')
const Thread = require('bare-thread')
const linkmapper = require('pear-mobile/map')

module.exports = (link, args= [], data = {}) => {
  // prepare globals of new thread
  Thread.prepare(require.resolve('./global.js'))

  console.log('running worker:', link)
  if (typeof link === 'string' && link.startsWith('pear://')) {
    const key = link
    link = linkmapper[link]?.resolved
    if (!link)
      throw new Error(`Could not find bundle for '${key}' in pear-mobile/map`)
  }
  const [parentReadFd, childWriteFd] = Pipe.pipe()
  const [childReadFd, parentWriteFd] = Pipe.pipe()
  new Thread(link, {
    data: { ...args, ...data, _readFd: childReadFd, _writeFd: childWriteFd }
  })
  // DO I NEED TO TRACK CHILDREN AN PROPERLY DESTROY PIPES?? ... ADD TO graceful-godbye INSTEAD??

  class ThreadPipe {
    // TODO: add autoexit like in Pear???
    #readPipe
    #writePipe

    constructor(readFd, writeFd) {
      this.#readPipe = new Pipe(readFd)
      this.#writePipe = new Pipe(writeFd)
    }

    on(event, callback) {
      return this.#readPipe.on(event, callback)
    }

    write(data) {
      return this.#writePipe.write(data)
    }

    // is this correct?
    destroy() {
      this.#readPipe.destroy()
      this.#writePipe.destroy()
    }

    end() {
      this.#writePipe.end()
      this.#readPipe.end()
    }
  }
  return new ThreadPipe(parentReadFd, parentWriteFd)
}
