import React from 'react'
import { Dropdown, DropdownMenu } from '../dropdown/Dropdown'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import Button from '../../components/button/Button'
import PeerList from '../peer-list/PeerList'
import Peer from '../peer-list/Peer'
import { MessageService, MessageType } from '../../notification/MessageService'

class ShareMenu extends React.Component {
  constructor (props) {
    super(props)
    this.shareMenuRef = React.createRef()
    this.setPeer = this.setPeer.bind(this)
    this.state = {
      peer: new Peer('', '')
    }
  }

  componentDidUpdate () {
    if (this.props.autofocus && this.props.isOpen) {
      if (!this.shareMenuRef.current) return

      const firstButton = this.shareMenuRef.current.querySelector('input')
      if (!firstButton) return

      firstButton.focus()
    }
  }

  setPeer (peer) {
    this.setState({
      peer: peer
    })
    MessageService.sendMessage(MessageType.SEARCH_PEER, peer.address)
  }

  share = () => {
    this.props.handleClose()
    this.props.onShare(this.state.peer.address)
  }

  onKeyDown = (e) => {
    if (e.key === 'Enter' && this.peerAddressIsValid()) {
      this.share()
    }
  }

  onPeerAddressChanged = (address) => {
    this.setPeer(new Peer('', address))
  }

  peerAddressIsValid = () => !this.peerAddressIsEmpty() && this.peerAddressHasValidPattern()

  peerAddressIsEmpty = () => this.state.peer.address.trim() === ''

  peerAddressHasValidPattern = () => this.state.peer.address.startsWith('/orbitdb/') && this.state.peer.address.endsWith('/shared_feed')

  render () {
    const { t, translateX, translateY, className } = this.props

    return (
      <Dropdown className={className}>
        <DropdownMenu
          ref={this.shareMenuRef}
          top={-8}
          arrowMarginRight='11px'
          left='calc(100% - 640px)'
          width={600}
          translateX={-translateX}
          translateY={-translateY}
          open={this.props.isOpen}
          onDismiss={this.props.handleClose}>
          <div className={'p-3'}>
            <div className={'text-center'}>{t('terms.sendToPeer')}</div>
            <label htmlFor={'peer-address'} className={'bold'}>{this.state.peer.name}</label>
            <input id={'peer-address'} className={'mt2 w-100'} type={'text'} placeholder={t('terms.enterDbAddress')} value={this.state.peer.address} onChange={e => { this.onPeerAddressChanged(e.target.value) }} onKeyDown={this.onKeyDown} />
            <Button bg='bg-navy' color='white' className='f6 flex justify-center items-center mt1 w-100' onClick={this.share} disabled={!this.peerAddressIsValid() }>{t('terms.send')}</Button>
          </div>
          <div className={'p-3 bg-snow-muted'}>
            <PeerList setPeer={this.setPeer}/>
          </div>
        </DropdownMenu>
      </Dropdown>
    )
  }
}

ShareMenu.props = {
  isOpen: PropTypes.bool.isRequired,
  handleClick: PropTypes.func,
  translateX: PropTypes.number.isRequired,
  translateY: PropTypes.number.isRequired,
  onShare: PropTypes.func,
  autofocus: PropTypes.bool,
  t: PropTypes.func.isRequired
}

ShareMenu.defaultProps = {
  isOpen: false,
  top: 0,
  left: 0,
  right: 'auto',
  translateX: 0,
  translateY: 0,
  className: ''
}

export default withTranslation('files', { withRef: true })(ShareMenu)
