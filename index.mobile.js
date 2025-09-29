module.exports = async function run (link, source, args = []) {
  const { Worklet } = require('react-native-bare-kit')

  //////// For when using link (need to download, create bundle ect)

  // const isPear = link.startsWith('pear://')
  // const isFile = link.startsWith('file://')
  // const onDisk = key === null

  // const runner = new Runner(link)

  // if (onDisk === false && isPear === false) throw ERR_INVALID_INPUT('Key must start with pear://')

  // const parentWorklet = new Worklet()
  // const appName = 'autopass-example'
  // if (isPear) {
  //   parentWorklet.start('./mobile-runner.js', [link, args[0], appName])
  // }
  // else if (isFile) runner.startFile()

  const worklet = new Worklet()
  await worklet.start(link, source, args)

  return worklet
}
