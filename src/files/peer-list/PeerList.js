import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import Peer from './Peer'
import { MessageService, MessageType } from '../../notification/MessageService'
import { OrbitDbProvider } from '../../bundles/orbitdb-provider'

const PeerList = ({ t, className, setPeer, savePeerToFriendsList }) => {
  const [peers, setPeers] = useState([])
  const [peerNameInput, setPeerNameInput] = useState('')
  const [subscription, setSubscription] = useState(null)
  const [searchedPeer, setSearchedPeer] = useState('')

  useEffect(() => {
    loadPeers()
    subscribeToSearchPeer()

    return () => {
      unsubscribeToContentReceived()
    }
  }, [])

  const loadPeers = () => {
    const keyValue = OrbitDbProvider.getOwnKeyValue()
    if (!keyValue || isEmpty(keyValue.all)) return
    const all = keyValue.all
    const peers = []
    for (const address in all) {
      peers.push(new Peer(all[address], address))
    }
    setPeers(peers)
  }

  const subscribeToSearchPeer = () => {
    setSubscription(MessageService.getMessages()
      .subscribe(message => {
        if (message.type !== MessageType.SEARCH_PEER) return
        setSearchedPeer(message.data)
      }))
  }

  const unsubscribeToContentReceived = () => {
    subscription?.unsubscribe()
  }

  const onClickPeer = (peer: Peer) => {
    setPeer(peer)
  }

  const onKeyPressPeer = (e, peer: Peer) => {
    if (e.key === 'Enter') {
      onClickPeer(peer)
    }
  }

  const onClickEdit = (peerToEdit: Peer) => {
    setPeerNameInput(peerToEdit.name)
    setPeers(peers.map(peer => {
      if (peer.address === peerToEdit.address) {
        if (peer.inEditMode && peer.name !== peerNameInput) {
          updatePeerName(peer)
        }
        peer.inEditMode = !peer.inEditMode
      } else {
        peer.inEditMode = false
      }
      return peer
    }))
  }

  const onPeerNameInputChanged = (name: string) => {
    setPeerNameInput(name)
  }

  const onClickDelete = (peerToDelete: Peer) => {
    setPeers(peers.filter(peer => peer.address !== peerToDelete.address))
    deletePeerFromFriendsList(peerToDelete)
  }

  const updatePeerName = (peer) => {
    peer.name = peerNameInput
    savePeerToFriendsList(peer, true)
  }

  const onNameInputKeyDown = (e, peer: Peer) => {
    if (e.key === 'Enter') {
      peer.inEditMode = false
      updatePeerName(peer)
    }
    if (e.key === 'Escape') {
      setPeers(peers.map(peer => {
        peer.inEditMode = false
        return peer
      }))
    }
  }

  const isPartOfFilter = (peer) => {
    if (searchedPeer.trim().length === 0) return true

    return peer.name.toLowerCase().includes(searchedPeer.toLowerCase()) ||
      peer.address.toLowerCase().includes(searchedPeer.toLowerCase())
  }

  const deletePeerFromFriendsList = (peerToDelete: Peer) => {
    const keyValue = OrbitDbProvider.getOwnKeyValue()
    if (!keyValue) return
    keyValue.del(peerToDelete.address)
      .then(console.log('Friend deleted: {name: "' + peerToDelete.name + '", address: "' + peerToDelete.address + '"}'))
  }

  const isEmpty = (obj) => obj && Object.keys(obj).length === 0 && obj.constructor === Object

  return (
    <div className={className}>
      <div className={'text-center mb3'}>{t('terms.friends')}</div>
      <div>
        {
          peers.length === 0
            ? <div className={'gray'}>{t('terms.noFriends')}</div>
            : peers.map((peer, index) => {
              if (isPartOfFilter(peer)) {
                return <div key={peer.address} className={'hover-bg-transparent-blue clickable pt1 pb2 pr1 pl1 border-top flex center-container '}>
                  <div role={'button'} tabIndex={index} onClick={() => onClickPeer(peer)} onKeyPress={e => onKeyPressPeer(e, peer)}>
                    {
                      peer.inEditMode
                        ? <input value={peerNameInput} type={'text'} onChange={e => { onPeerNameInputChanged(e.target.value) }} onKeyDown={e => onNameInputKeyDown(e, peer)} onClick={e => e.stopPropagation()}/>
                        : <div>{(peer.name && peer.name.trim().length > 0) ? peer.name : t('terms.giveAName')}</div>
                    }
                    <div className={'f7 gray truncate monospace'}>{peer.address}</div>
                  </div>
                  <div>
                    <button onClick={() => onClickEdit(peer)} className={'center-element w2_5 right-2 blue-hover transparent-25'}>
                      <img src={editIcon} alt={'Change name'} title={t('terms.changeName')}/>
                    </button>
                    <button onClick={() => onClickDelete(peer)} className={'center-element w2_5 right-0 red-hover transparent-25'}>
                      <img src={deleteIcon} alt={'Delete'} title={t('terms.deleteFriend')}/>
                    </button>
                  </div>
                </div>
              }
            })
        }
      </div>
    </div>
  )
}

PeerList.props = {
  t: PropTypes.func.isRequired
}

const editIcon = 'icons/Edit_black_48dp.png'
const deleteIcon = 'icons/Delete_black_48dp.png'

export default withTranslation('files', { withRef: true })(PeerList)
