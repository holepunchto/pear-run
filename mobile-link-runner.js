const Hyperswarm = require('hyperswarm')
const Hyperdrive = require('hyperdrive')
const plink = require('pear-link')
const Corestore = require('corestore')
const crypto = require('hypercore-crypto')
const run = require('./lib/mobile.js')
const { fileURLToPath } = require('bare-url')

module.exports = class Runner {
    constructor(path) {
        console.log('logging path', path)
        this.path = fileURLToPath(path)
        this.swarm = null
        this.store = null
        this.drive = null
    }
    
    async fetchBundle (link){
        this.store = new Corestore(this.path)
        await this.store.ready()

        if (this.swarm === null){
            this.swarm = new Hyperswarm({
                keyPair: await this.store.createKeyPair('store-keys')
            })
        }

        const { drive } = plink.parse(link)
    
        this.swarm.on('connection', async (conn) => {
            await this.store.replicate(conn)
            console.log('connected to peer', conn)
        })
        await this.swarm.join(crypto.discoveryKey(drive.key))

        this.drive = new Hyperdrive(this.store, drive.key)
        await this.drive.ready()
    }

    async close (){
        await this.drive.close()
        await this.swarm.destroy()
        await this.store.close()
    }

    async run (link){
        console.log('running link', link)
        console.log('path', this.path)
        const bundle = await this.fetchBundle(link)
        // return run(bundle)
    }
}
