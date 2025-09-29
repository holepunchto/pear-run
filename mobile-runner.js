const Hyperswarm = require('hyperswarm')
const Hyperdrive = require('hyperdrive')
const plink = require('pear-link')
const Corestore = require('corestore')
const { join } = require('bare-path')
const { URL } = require('bare-url')
const crypto = require('hypercore-crypto')

module.exports = class Runner {
    constructor() {
        this.link = Bare.argv[0]
        this.swarm = null
        this.path = join(URL.fileURLToPath(Bare.argv[1]), Bare.argv[2]) /// path to app
        this.store = new Corestore(this.path)
        this.drive = new Hyperdrive(this.store, this.key)
    }
    static async startLink (){
        if (this.swarm === null){
            this.swarm = new Hyperswarm({
                keyPair: await this.store.createKeyPair('store-keys')
            })
        }

        const { drive, pathname, search, hash } = plink.parse(this.link)
        const { key } = drive
        const isPath = isPear === false && isFile === false
        const onDisk = key === null

        if (onDisk === false && isPear === false) throw ERR_INVALID_INPUT('Key must start with pear://')
        
        this.swarm.on('connection', async (conn) => {
            await this.store.replicate(conn)
            console.log('connected to peer', conn)
        })
        await this.swarm.join(crypto.discoveryKey(key))
        
    }
    static startFile (){

    }
}
