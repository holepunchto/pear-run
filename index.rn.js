module.exports = function run(link = 'main', args = []) {
  const { Worklet } = require('react-native-bare-kit')
  const map = require('../../.pear/maps/pear-links-map-rn') // is always the same since its the root worklet
  const bundle = typeof map[link]?.bundle === 'object' ? map[link].bundle.default : map[link]?.bundle
  const pkgContent = map[link]?.pkgContent
  const wrapper = map['pear-api']?.bundle
  if (!bundle) throw new Error(`could not find bundle for ${link}`)
  const filename = link.startsWith('pear://') ? map[link]?.hash :link
  
  // TODO: increase performance -> send bundle over RPC -> ideal case: require.resolve bundle inside the wrapper thread
  const worklet = new Worklet()
  const info = { link, filename: `/${filename}.bundle`, pkgContent }
  args = [...args, JSON.stringify(info), bundle]
  worklet.start(`/${filename}-wrapper.bundle`, wrapper, args)

  return worklet.IPC
}
