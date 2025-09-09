const { isBareKit, isPear } = require('which-runtime')

if (isBareKit) {
  module.exports = eval('require')('./lib/bare-kit.js')
} else if (isPear) {
  module.exports = eval('require')('./lib/pear.js')
}
