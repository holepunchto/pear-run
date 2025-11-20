'use strict'

global.Pear = {
  exit(code) {
    global.Bare.exit(code)
  }
}

return 'short-lived'
