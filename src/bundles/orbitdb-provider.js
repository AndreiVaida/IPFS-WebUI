import { MessageService, MessageType } from '../notification/MessageService'

/** @type OrbitDb */
let orbitDb
/** @type FeedStore */
let orbitDbOwnFeedStore

/**
 * Provider for OrbitDb instances.
 * Can be used to:
 * • connect to any database (to another peer)
 * • set and retrieve own database
 * • log database specific events
 *
 * When set own database, it sends a message to the MessageService with the set db.
 */
export const OrbitDbProvider = {

  /**
   * Connects, loads and returns the OrbitDb Feed Store of the provided address.
   * @param {string} address is the address of the DB to connect (can be the peer ID). It must be a valid accessible DB address.
   * @returns {Promise<FeedStore>}
   * @throws an error if cannot connect to the DB
   */
  connectToFeed: async (address) => {
    const feedStore = await orbitDb.feed(address, orbitDbOptionsParticipant)
    OrbitDbProvider.subscribeToOrbitDbEvents(feedStore)
    await feedStore.load()
    return feedStore
  },

  /**
   * @return {OrbitDb}
   */
  getOrbitDb: () => orbitDb,
  /**
   * Set the OrbitDb.
   * @param {OrbitDb} db
   */
  setOrbitDb: (db) => { orbitDb = db },

  /**
   * @return {FeedStore}
   */
  getOwnFeed: () => orbitDbOwnFeedStore,
  /**
   * Set the own Feed Store database and send it as a message to MessageService.
   * @param {FeedStore} ownFeedStore
   */
  setOwnFeed: (ownFeedStore) => {
    orbitDbOwnFeedStore = ownFeedStore
    MessageService.sendMessage(MessageType.DATABASE_INIT, orbitDbOwnFeedStore)
  },

  /**
   * Subscribes to relevant events regarding connecting & retrieving data for provided database and logs the events.
   * Useful for debugging.
   * @param {FeedStore|KeyValueStore} databaseInstance - any OrbitDb database instance
   */
  subscribeToOrbitDbEvents: (databaseInstance) => {
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
