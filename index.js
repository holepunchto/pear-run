const { isPear } = require('which-runtime')

try{
if (!isPear) module.exports = require('./lib/mobile.js')
else module.exports = require('./lib/desktop.js')
} catch (err){
  console.error(err)
}