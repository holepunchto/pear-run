const { isIOS, isAndroid, isExpo, isReactNative } = require('which-runtime')
const isMobile = isIOS || isAndroid || isExpo || isReactNative

try{
if (isMobile && !isReactNative) module.exports = require('./lib/mobile.js')
else module.exports = require('./lib/react-native.js')
} catch (err){
  console.error(err)
}
