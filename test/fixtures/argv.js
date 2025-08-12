'use strict'

global.Pear = { exit (code) { global.Bare.exit(code) } }

const pipe = require('pear-pipe')()
pipe.write(JSON.stringify(global.Bare.argv))
