const { isBareKit, isPear, isIOS, isAndroid, isBare } = require('which-runtime')

// port to which-runtime
const isReactNative = typeof global !== 'undefined' &&
  (global.navigator?.product === 'ReactNative' ||
   global.__DEV__ === true ||
   typeof global.HermesInternal !== 'undefined' ||
   (typeof global.require !== 'undefined' && global.require.main?.filename?.includes('react-native')))

const isExpo = typeof global !== 'undefined' &&
  (global.__expo ||
   global.ExpoModules ||
   (typeof global.require !== 'undefined' && global.require.main?.filename?.includes('expo')))

const isMobile = isReactNative || isExpo || isIOS || isAndroid

if (isBareKit || isMobile) {
  module.exports = require('./lib/bare-kit.js')
} else if (isPear || isBare) {
  module.exports = eval('require')('./lib/pear.js') // eslint-disable-line no-eval
}
