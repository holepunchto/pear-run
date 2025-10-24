const Pipe = require('bare-pipe')

/////// For mobile we need to start every other worker as a bare thread (needs to be in same bundle)
module.exports =  (filename, args = []) => {
  console.log('using thread run')
  // TODO: make pear links work (similar to mobile react native env)
  const { Thread } = global.Bare 
  filename = filename.replace(/^[\\\/]/, '')
  const fullPath = filename

  const [parentReadFd, childWriteFd] = Pipe.pipe()
  const [childReadFd, parentWriteFd] = Pipe.pipe()
  
  new Thread(fullPath, {
    data: { args, readFd: childReadFd, writeFd: childWriteFd }
  })

  const stream = {
    _readPipe: new Pipe(parentReadFd),
    _writePipe: new Pipe(parentWriteFd),
    
    on: function(event, callback) {
      return this._readPipe.on(event, callback)
    },
    // is this correct?
    write: function(data) {
      return this._writePipe.write(data)
    },

    destroy: function() {
      this._readPipe.destroy()
      this._writePipe.destroy()
    },

    end: function() {
      this._readPipe.end()
      this._writePipe.end()
    }

  }

  return stream
}