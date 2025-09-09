module.exports = async function spawn(filename, source, args = []) {
  const { Worklet } = require('react-native-bare-kit')

  const worklet = new Worklet()
  await worklet.start(filename, source, args)

  return worklet
}
