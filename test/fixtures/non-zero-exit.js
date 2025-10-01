'use strict'

global.Pear = {
  exit() {
    global.Bare.exit(1)
  }
}

require('pear-pipe')()
