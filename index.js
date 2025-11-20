const { isPear } = require('which-runtime')

try{
if (!isPear) module.exports = require('./lib/mobile.js') // TODO: need different check when we add Pear global to mobile
else module.exports = require('./lib/desktop.js')
} catch (err){
  console.error(err)
}