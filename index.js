const { isBareKit } = require('which-runtime')

try{
if (isBareKit) module.exports = require('./lib/mobile.js')
else module.exports = require('./lib/desktop.js')
} catch (err){
  console.error(err)
}