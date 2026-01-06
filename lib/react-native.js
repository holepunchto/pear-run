module.exports = function run(link = 'main', args = []) {
  const { Worklet } = require('react-native-bare-kit')
  const map = require('pear-mobile/map-rn')
  const bundle = map[link]?.bundle
  if ( !bundle ) throw new Error(`could not find bundle for ${link}`)
  if ( link.startsWith('pear://') ) link = map[link]?.hash
  // TODO: use linkmapper for running pear links like in ./mobile.js

  const worklet = new Worklet()
  worklet.start(`/${link}.bundle`, bundle, args)

  return worklet.IPC
}
