const Pipe = require('bare-pipe')
const Thread = require('bare-thread')

// TODO: should prob use ESM instead
let linkmapper = {}
try {
  // its important that this uses the module from the project root (ie user has to install pear-bundle and run the build script)
  linkmapper = require('pear-bundle/map')
} catch (err) {} // TODO: need to test how bare bundler and metro bundler in react native handles (need to catch in case we only run local workers)

module.exports = (source, args = [], data = {}) => {
  if (typeof source === 'string' && source.startsWith('pear://')){
    const link = source
    source = linkmapper[source]?.path
    if (!source) throw new Error(`Could not find bundle for '${link}' in pear-bundle/map`)
  }
  console.log(source)
  const [parentReadFd, childWriteFd] = Pipe.pipe()
  const [childReadFd, parentWriteFd] = Pipe.pipe()
  console.log('test 1')
  new Thread(require.resolve(source), {data: { args, ...data, _readFd: childReadFd, _writeFd: childWriteFd }})
  // not joining thread or we get stuck in break loop
  console.log('test 2')

  class ThreadPipe {
    // TODO: add autoexit like in Pear???
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
  console.log('test 3')
  const pipe = new ThreadPipe(parentReadFd, parentWriteFd)
  console.log('test 4')
  return pipe
}