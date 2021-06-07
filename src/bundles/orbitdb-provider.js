import { MessageService, MessageType } from '../notification/MessageService'
// import { join } from 'path'
import { connect } from 'redux-bundler-react'
import withTour from '../components/tour/withTour'
import { join } from 'path'
import { realMfsPath } from './files/actions'

/** @type OrbitDb */
let orbitDb
/** @type FeedStore */
let orbitDbOwnFeedStore
/** @type IPFSService */
let ipfsService
/** @type KeyValueStore */
let orbitDbOwnKeyValueStore

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
    const feedOptions = { ...orbitDbOptionsParticipant, type: 'feed' }
    const feedStore = await orbitDb.open(address, feedOptions)
    OrbitDbProvider.subscribeToOrbitDbEvents(feedStore, true)
    await feedStore.load()
    return feedStore
  },

  /**
   * Set the ipfs service used to update the local repository.
   * @param {IpfsService} ipfs
   */
  setIpfs: (ipfs) => { ipfsService = ipfs },

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
   * @return {KeyValueStore}
   */
  getOwnKeyValue: () => orbitDbOwnKeyValueStore,
  /**
   * Set the own KeyValue Store database.
   * @param {KeyValueStore} ownKeyValueStore
   */
  setOwnKeyValue: (ownKeyValueStore) => {
    orbitDbOwnKeyValueStore = ownKeyValueStore
  },

  /**
   * Subscribes to relevant events regarding connecting & retrieving data for provided database and logs the events.
   * Useful for debugging.
   * @param {FeedStore|KeyValueStore} databaseInstance - any OrbitDb database instance
   * @param {boolean} readonly - if set to true it only logs events in console, if set to false it imports and removes data at specific events
   */
  subscribeToOrbitDbEvents: (databaseInstance, readonly = false) => {
    const readonlyMessage = readonly ? ' [readonly]' : ''
    databaseInstance.events.on('replicated', address => {
      console.log('> replicated: ' + address + readonlyMessage)
    })
    databaseInstance.events.on('replicate', address => {
      console.log('> replicated: ' + address + readonlyMessage)
      if (readonly) return
      importNotDownloadedFiles()
    })
    databaseInstance.events.on('peer', peer => {
      console.log('> peer connected: ' + peer + readonlyMessage)
    })
    databaseInstance.events.on('peer.exchanged', (peer, address, heads) => {
      console.log('> peer.exchanged: {peer: ' + peer + ', address: ' + address, ', heads: ' + heads + '}' + readonlyMessage)
    })
    databaseInstance.events.on('write', (address, entry, heads) => {
      const fileAsString = entry.payload.value
      console.log('> write { address: ' + address + ', file: ' + fileAsString + readonlyMessage)
      if (readonly) return

      const file = JSON.parse(fileAsString)
      const hash = entry.hash

      importFileAndRemoveFromDb(file, hash)
    })
  }
}

/**
 * Imports the file to MFS and, if succeeded, removes it from the Feed database.
 * @param {{cid: String, name: String}} file - the content to add to MFS
 * @param {string} hash - the hash of the file in own Feed database
 */
const importFileAndRemoveFromDb = async (file, hash) => {
  importFileToShareFolder(file)
    .then(success => {
      if (!success) return
      orbitDbOwnFeedStore.remove(hash)
    })
}

/**
 * Download the file to local IPFS in the shared folder.
 * @param {{cid: String, name: String}} file - the content to add to MFS
 */
const importFileToShareFolder = async (file) => {
  await createFolderIfNotExist('/', SHARED_FOLDER)

  const path = '/files/' + SHARED_FOLDER
  const cid = file.cid

  const mfsPath = realMfsPath(cid)
  /** @type {string} */
  const ipfsName = (mfsPath.split('/').pop())
  const dst = realMfsPath(join(path, file.name))
  const srcPath = cid.startsWith('/') ? cid : `/ipfs/${ipfsName}`

  try {
    await ipfsService.files.cp(srcPath, dst)
    MessageService.sendMessage(MessageType.CONTENT_RECEIVED, file)
    return true
  } catch (e) {
    console.error('Cannot import content ' + file.cid + ' from OrbitDb to local IPFS repository.')
    return false
  }
}

/**
 * Create a folder at specified path, if it doesn't exists.
 * It does not support parent folder creation, i.e. the last folder from path must exists.
 * @param {string} root existing path to root of the new folder (must begin with '/')
 * @param {string} folderName - name of the folder to be created
 * @returns {Promise<void>} of execution
 */
const createFolderIfNotExist = async (root, folderName) => {
  for await (const item of ipfsService.files.ls(root)) {
    if (item.type === 'directory' && item.name === folderName) {
      return Promise.resolve()
    }
  }

  const path = root + '/' + folderName
  return ipfsService.files.mkdir(realMfsPath(path))
}

/**
 * Import to MFS all the file from the Feed database.
 */
const importNotDownloadedFiles = async () => {
  const files = orbitDbOwnFeedStore.iterator({ limit: -1 })
    .collect()
    .map((entry) => {
      const file = JSON.parse(entry.payload.value)
      file.hash = entry.hash
      return file
    })

  console.log('Found ' + files.length + ' not downloaded files: ' + JSON.stringify(files))

  for (const fileWithHash of files) {
    importFileAndRemoveFromDb(fileWithHash, fileWithHash.hash)
  }
}

const SHARED_FOLDER = 'Shared with me'

export const orbitDbOptionsOwner = {
  overwrite: false,
  replicate: true,
  localOnly: false,
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

export default connect(
  'doFilesMakeDir',
  withTour()
)
