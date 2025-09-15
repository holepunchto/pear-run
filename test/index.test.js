'use strict'
/* globals Bare */
global.Pear = {}
const test = require('brittle')
const path = require('bare-path')
const os = require('bare-os')
const run = require('..')
os.chdir(__dirname)
const fixtures = {
  echo: path.join(__dirname, 'fixtures', 'echo.js'),
  argv: path.join(__dirname, 'fixtures', 'argv.js'),
  nonZeroExit: path.join(__dirname, 'fixtures', 'non-zero-exit.js')
}
const ARGV = global.Bare.argv.slice(1)

test('returns a pipe that talks to the sub app', (t) => {
  t.plan(1)
  class API {
    static RUNTIME = global.Bare.argv[0]
    static RTI = {}
    static RUNTIME_ARGV = []
    app = {}
  }
  global.Pear = new API()
  const link = fixtures.echo
  global.Bare.argv.length = 1
  global.Bare.argv.push('run', link)
  t.teardown(() => {
    delete global.Pear
    global.Bare.argv.length = 1
    global.Bare.argv.push(...ARGV)
    pipe.end()
  })
  const pipe = run(link)
  pipe.on('data', (data) => {
    t.is(data.toString(), 'hello')
  })
  pipe.write('hello')
})

test('injects --trusted flag into argv', (t) => {
  t.plan(1)

  class API {
    static RUNTIME = global.Bare.argv[0]
    static RTI = {}
    static RUNTIME_ARGV = []
    app = {}
  }
  global.Pear = new API()
  const link = fixtures.argv
  global.Bare.argv.length = 1
  global.Bare.argv.push('run', link)
  t.teardown(() => {
    delete global.Pear
    global.Bare.argv.length = 1
    global.Bare.argv.push(...ARGV)
    pipe.end()
  })
  const pipe = run(link)
  pipe.once('data', (data) => {
    const childArgv = JSON.parse(data)
    t.is(childArgv[2], '--trusted')
  })
})

test('avoids --trusted flag duplication', (t) => {
  t.plan(1)
  class API {
    static RUNTIME = global.Bare.argv[0]
    static RTI = {}
    static RUNTIME_ARGV = []
    app = {}
  }
  global.Pear = new API()
  const link = fixtures.argv
  global.Bare.argv.length = 1
  global.Bare.argv.push('run', '--trusted', link)
  t.teardown(() => {
    delete global.Pear
    global.Bare.argv.length = 1
    global.Bare.argv.push(...ARGV)
    pipe.end()
  })
  const pipe = run(link)
  pipe.once('data', (data) => {
    const childArgv = JSON.parse(data)
    t.is(childArgv.filter((arg) => arg === '--trusted').length, 1)
  })
})

test('injects --parent when RTI.startId is set', t => {
  t.plan(1)

  class API {
    static RUNTIME = global.Bare.argv[0]
    static RTI = { startId: 'de4215533cd3343ed3331111245abf' }
    static RUNTIME_ARGV = []
    app = {}
  }
  global.Pear = new API()
  const link = fixtures.argv
  global.Bare.argv.length = 1
  global.Bare.argv.push('run', link)
  const pipe = run(link)
  t.teardown(() => {
    delete global.Pear
    global.Bare.argv.length = 1
    global.Bare.argv.push(...ARGV)
    pipe.end()
  })
  pipe.once('data', (data) => {
    const childArgv = JSON.parse(data)
    const i = childArgv.indexOf('--parent')
    t.ok(i !== -1 && childArgv[i + 1] === 'de4215533cd3343ed3331111245abf')
  })
})

test('passes args input at the tail', (t) => {
  t.plan(1)

  class API {
    static RUNTIME = global.Bare.argv[0]
    static RTI = {}
    static RUNTIME_ARGV = []
    app = {}
  }
  global.Pear = new API()
  const link = fixtures.argv
  global.Bare.argv.length = 1
  global.Bare.argv.push('run', link)
  t.teardown(() => {
    delete global.Pear
    global.Bare.argv.length = 1
    global.Bare.argv.push(...ARGV)
    pipe.end()
  })
  const args = ['--foo', 'bar']
  const pipe = run(link, args)
  pipe.once('data', (data) => {
    const childArgv = JSON.parse(data)
    const tail = childArgv.slice(-args.length)
    t.alike(tail, args)
  })
})

test('passes Pear.constructor.RUNTIME_ARGV at the head', (t) => {
  t.plan(1)

  class API {
    static RUNTIME = global.Bare.argv[0]
    static RTI = {}
    static RUNTIME_ARGV = ['alt-run', 'some', 'args']
    app = {}
  }
  global.Pear = new API()
  const link = fixtures.argv
  global.Bare.argv.length = 1
  global.Bare.argv.push('run', link)
  t.teardown(() => {
    delete global.Pear
    global.Bare.argv.length = 1
    global.Bare.argv.push(...ARGV)
    pipe.end()
  })
  const args = ['--foo', 'bar']
  const pipe = run(link, args)
  pipe.once('data', (data) => {
    const childArgv = JSON.parse(data)
    t.alike(childArgv.slice(2), ['some', 'args', 'run', '--trusted', fixtures.argv, '--foo', 'bar'])
  })
})

test('pipe emits crash event on non-zero child exit', (t) => {
  t.plan(1)
  class API {
    static RUNTIME = global.Bare.argv[0]
    static RTI = {}
    static RUNTIME_ARGV = []
    app = {}
  }
  global.Pear = new API()
  const link = fixtures.nonZeroExit
  global.Bare.argv.length = 1
  global.Bare.argv.push('run', link)
  t.teardown(() => {
    delete global.Pear
    global.Bare.argv.length = 1
    global.Bare.argv.push(...ARGV)
  })
  const pipe = run(link)
  pipe.once('crash', (info) => {
    t.is(info.exitCode, 1)
  })
  pipe.end()
})

test('locks to parent fork.length version if running link with same key (w/out fork.length) as in parent applink', t => {
  t.plan(2)

  class API {
    static RUNTIME = Bare.argv[0]
    static RTI = {}
    static RUNTIME_ARGV = []
    app = { applink: 'pear://keet', fork: 4, length: 9 }
  }
  global.Pear = new API()

  const link = 'pear://keet/some/path'

  Bare.argv.length = 1
  Bare.argv.push('run', link)

  const pipe = run(link)

  t.teardown(() => {
    delete global.Pear
    global.Bare.argv.length = 1
    global.Bare.argv.push(...ARGV)
    pipe.end()
  })

  pipe.once('data', (data) => {
    const argv = JSON.parse(data)
    const out = argv[3]
    t.ok(out.startsWith('pear://4.9.'), 'fork.length prefix present')
    t.ok(out.endsWith('/some/path'), 'pathname preserved')
  })
})

test('preserves link fork.length version if supplied even when running link with same key as in parent applink', t => {
  t.plan(2)

  class API {
    static RUNTIME = Bare.argv[0]
    static RTI = {}
    static RUNTIME_ARGV = []
    app = { applink: 'pear://keet', fork: 4, length: 9 }
  }
  global.Pear = new API()

  const link = 'pear://0.6.keet/some/path'

  Bare.argv.length = 1
  Bare.argv.push('run', link)

  const pipe = run(link)

  t.teardown(() => {
    delete global.Pear
    global.Bare.argv.length = 1
    global.Bare.argv.push(...ARGV)
    pipe.end()
  })

  pipe.once('data', (data) => {
    const argv = JSON.parse(data)
    const out = argv[3]
    t.ok(out.startsWith('pear://0.6.'), 'fork.length prefix present')
    t.ok(out.endsWith('/some/path'), 'pathname preserved')
  })
})

test('normalizes pear://dev link to relative path', t => {
  t.plan(1)

  class API {
    static RUNTIME = Bare.argv[0]
    static RTI = {}
    static RUNTIME_ARGV = []
    app = {}
  }
  global.Pear = new API()

  const link = 'pear://dev/fixtures/echo.js'
  Bare.argv.length = 1
  Bare.argv.push('run', link)

  const pipe = run(link)

  t.teardown(() => {
    delete global.Pear
    global.Bare.argv.length = 1
    global.Bare.argv.push(...ARGV)
    pipe.end()
  })

  pipe.on('data', (data) => {
    t.is(data.toString(), 'hello')
  })
  pipe.write('hello')
})

test('splices out --links <value>', t => {
  t.plan(2)

  class API {
    static RUNTIME = Bare.argv[0]
    static RTI = {}
    static RUNTIME_ARGV = []
    app = {}
  }
  global.Pear = new API()

  const link = fixtures.argv

  Bare.argv.length = 1
  Bare.argv.push('run', '--links', 'pear://test,./some/other', link)

  const pipe = run(link)

  t.teardown(() => {
    delete global.Pear
    global.Bare.argv.length = 1
    global.Bare.argv.push(...ARGV)
    pipe.end()
  })

  pipe.once('data', (data) => {
    const argv = JSON.parse(data)
    t.not(argv.includes('--links'))
    t.not(argv.includes('pear://test,./some/other'))
  })
})
