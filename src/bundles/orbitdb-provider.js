export default class OrbitDbProvider {
  orbitDb;

  constructor (orbitDb: OrbitDb) {
    this.orbitDb = orbitDb
  }

  /**
   * Connects, loads and returns the OrbitDb Feed Store of the provided address.
   * @param {string} address is the address of the DB to connect (can be the peer ID). It must be a valid accessible DB address.
   * @returns {Promise<FeedStore>}
   * @throws an error if cannot connect to the DB
   */
  async getFeed (address) {
    const feedStore = await this.orbitDb.feed(address, orbitDbOptionsParticipant)
    OrbitDbProvider.subscribeToOrbitDbEvents(feedStore)
    await feedStore.load()
    return feedStore
  }

  /**
   * Subscribes to relevant events regarding connecting & retrieving data for provided database and logs the events.
   * Useful for debugging.
   * @param {FeedStore|KeyValueStore} databaseInstance - any OrbitDb database instance
   */
  static subscribeToOrbitDbEvents = (databaseInstance: FeedStore|KeyValueStore) => {
    databaseInstance.events.on('replicated', address => {
      console.log('> replicated: ' + address)
    })
    databaseInstance.events.on('replicate', address => {
      console.log('> replicated: ' + address)
    })
    databaseInstance.events.on('peer', peer => {
      console.log('> peer connected: ' + peer)
    })
    databaseInstance.events.on('peer.exchanged', (peer, address, heads) => {
      console.log('> peer.exchanged: {peer: ' + peer + ', address: ' + address, ', heads: ' + heads + '}')
    })
    databaseInstance.events.on('write', (address, entry, heads) => {
      console.log('> write { address: ' + address + ', entry: ' + entry + ', heads: ' + heads + ' }')
    })
  }
}

export const orbitDbOptionsOwner = {
  overwrite: false,
  replicate: true,
  accessController: {
    type: 'orbitdb',
    write: ['*']
  }
}

export const orbitDbOptionsParticipant = {
  create: false,
  replicate: true,
  overwrite: false
}
