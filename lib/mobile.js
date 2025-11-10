const Pipe = require('bare-pipe')
const Thread = require('bare-thread')
const Runner = require('../mobile-link-runner.js')
const goodbye = require('graceful-goodbye')

/////// For mobile we need to start every other worker as a bare thread (needs to be in same bundle)
/// we put it async for now, but later if will be sync because the fetch happens on build, meanin the actual thread run can be sync
module.exports = async (link, args = [], data = {}) => {
  if ( link.startsWith('pear://') ) {
    if (typeof Bare.argv[0] !== 'string') throw new Error('appPath is required for seeded workers')
    const runner = new Runner(Bare.argv[0])
    goodbye(() => runner.close())
    return await runner.run(link)
  }
  const [parentReadFd, childWriteFd] = Pipe.pipe()
  const [childReadFd, parentWriteFd] = Pipe.pipe()
  
  new Thread(link, {
    data: { args, ...data, _readFd: childReadFd, _writeFd: childWriteFd }
  })

  class ThreadPipe {
    // TODO: add autoexit
    #readPipe
    #writePipe
    
    constructor (readFd, writeFd) {
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