const os = require('bare-os')
const subprocess = require('bare-subprocess')

module.exports =  function spawn(filename, _, args = []) {
  const executable = os.execPath()

  args = Array.isArray(_) ? _ : args

  filename = filename.replace(/^[\\|/]/, '')

  const child = subprocess.spawn(executable, [filename, ...args], {
    stdio: ['inherit', 'inherit', 'inherit', 'pipe']
  })

  return child.stdio[3]
}