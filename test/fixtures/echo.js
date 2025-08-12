'use strict'

global.Pear = { exit (code) { global.Bare.exit(code) } }

const pipe = require('pear-pipe')()
pipe.on('data', (data) => pipe.write(data))
