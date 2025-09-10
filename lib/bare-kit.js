import { Worklet } from 'react-native-bare-kit'

module.exports = function spawn(filename, source, args = []) {
  const worklet = new Worklet()
  worklet.start(filename, source, args)

  return worklet
}
