import React from 'react'
import { withTranslation } from 'react-i18next'
import { connect } from 'redux-bundler-react'
import VersionLink from '../components/version-link/VersionLink'
import { Definition, DefinitionList } from '../components/definition/Definition.js'
import { MessageService, MessageType } from '../notification/MessageService'
import { OrbitDbProvider } from '../bundles/orbitdb-provider'

class NodeInfo extends React.Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      orbitDbAddress: 'loading...'
    }
  }

  componentDidMount () {
    this.setOrbitDbAddress()
  }

  componentWillUnmount () {
    this.subscription?.unsubscribe()
  }

  getField (obj, field, fn) {
    if (obj && obj[field]) {
      if (fn) {
        return fn(obj[field])
      }

      return obj[field]
    }

    return ''
  }

  getVersion (identity) {
    const raw = this.getField(identity, 'agentVersion')
    return raw ? raw.split('/').join(' ') : ''
  }

  setOrbitDbAddress () {
    const ownDatabase = OrbitDbProvider.getOwnFeed()
    if (ownDatabase) {
      const address = ownDatabase.address.toString()
      this.setState({ orbitDbAddress: address })
    } else {
      this.subscription = MessageService.getMessages()
        .subscribe(message => {
          if (message.type !== MessageType.DATABASE_INIT) return
          const address = message.data.address.toString()
          this.setState({ orbitDbAddress: address })
        })
    }
  }

  render () {
    const { t, identity } = this.props

    return (
      <DefinitionList>
        <Definition term={t('terms.peerId')} desc={this.getField(identity, 'id')} />
        <Definition term={t('terms.orbitDbAddress')} desc={this.state.orbitDbAddress} descriptionClassName={'green-hover'} descriptionTitle={t('terms.copyThisLine')} />
        <Definition term={t('terms.agent')} desc={<VersionLink agentVersion={this.getField(identity, 'agentVersion')} />} />
        <Definition term={t('terms.ui')} desc={<a href={'https://github.com/ipfs-shipyard/ipfs-webui/releases/tag/v' + process.env.REACT_APP_VERSION} className='link blue' target='_blank' rel='noopener noreferrer'>v{process.env.REACT_APP_VERSION}</a>} />
      </DefinitionList>
    )
  }
}

export default connect(
  'selectIdentity',
  withTranslation('app')(NodeInfo)
)
