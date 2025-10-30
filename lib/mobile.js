const Pipe = require('bare-pipe')
const Thread = require('bare-thread')

/////// For mobile we need to start every other worker as a bare thread (needs to be in same bundle)
module.exports =  (filename, args = [], data = {}) => {

  const [parentReadFd, childWriteFd] = Pipe.pipe()
  const [childReadFd, parentWriteFd] = Pipe.pipe()
  
  new Thread(filename, {
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