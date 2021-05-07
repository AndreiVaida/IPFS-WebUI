import React from 'react'
import { Dropdown, DropdownMenu } from '../dropdown/Dropdown'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import Button from '../../components/button/Button'

class ShareMenu extends React.Component {
  constructor (props) {
    super(props)
    this.shareMenuRef = React.createRef()
    this.state = {
      peerIdentifier: ''
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

  setPeerIdentifier (peerIdentifier) {
    this.setState({
      peerIdentifier: peerIdentifier
    })
  }

  share = () => {
    this.props.handleClose()
    this.props.onShare(this.state.peerIdentifier)
  }

  handleKeyDown = (e) => {
    if (e.key === 'Enter' && !this.peerInputIsEmpty()) {
      this.share()
    }
  }

  peerInputIsEmpty = () => this.state.peerIdentifier.trim() === ''

  render () {
    const { translateX, translateY, className } = this.props

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
          className={'p-3'}
          open={this.props.isOpen}
          onDismiss={this.props.handleClose}>
          <label htmlFor={'peer-identifier'} className={'center mb2 bold'}>Share to a peer</label>
          <input id={'peer-identifier'} type={'text'} placeholder={'Enter your peer\'s CID...'} value={this.state.peerIdentifier} onChange={e => { this.setPeerIdentifier(e.target.value) }} onKeyDown={this.handleKeyDown} />
          <Button bg='bg-navy' color='white' className='f6 flex justify-center items-center mt1' onClick={this.share} disabled={this.peerInputIsEmpty() }>Send</Button>
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
  autofocus: PropTypes.bool
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
