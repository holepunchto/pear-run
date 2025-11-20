module.exports = function run (link, source, args = []) {
  const { Worklet } = require('react-native-bare-kit')

  // TODO: use linkmapper for running pear links like in ./mobile.js

  const worklet = new Worklet()
  worklet.start(link, source, args)

  return worklet.IPC
}