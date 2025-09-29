const Pipe = require('bare-pipe')

/////// For mobile we need to start every other worker as a bare thread (needs to be in same bundle)
module.exports =  (filename, args = []) => {
  const { Thread } = global.Bare 
  filename = filename.replace(/^[\\\/]/, '')
  const fullPath = filename

  // Create bidirectional pipes
  const [parentReadFd, childWriteFd] = Pipe.pipe()
  const [childReadFd, parentWriteFd] = Pipe.pipe()
  
  // Create thread
  new Thread(fullPath, {
    data: { args, readFd: childReadFd, writeFd: childWriteFd }
  })

  // Create a simple bidirectional stream
  const stream = {
    _readPipe: new Pipe(parentReadFd),
    _writePipe: new Pipe(parentWriteFd),
    
    on: function(event, callback) {
      return this._readPipe.on(event, callback)
    },
    
    write: function(data) {
      return this._writePipe.write(data)
    }
  }

  return stream
}