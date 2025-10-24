const { isMobile, isReactNative } = require('which-runtime')

try{
if (isMobile && !isReactNative) module.exports = require('./lib/mobile.js')
else module.exports = require('./lib/react-native.js')
} catch (err){
  console.error(err)
}
