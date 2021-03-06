import React from 'react'
import { Trans, withTranslation } from 'react-i18next'
import Box from '../box/Box'

export const AboutWebUiNewcomers = ({ t }) => {
  return (
    <Box className={'pt0'}>
      <h2 className='mt0 mb0 montserrat fw1 f2 charcoal text-center'>{t('welcomeInfoNewcomers.salutation')}</h2>
      <h2 className='mt0 mb3 montserrat fw9-m f2 charcoal text-center'>{t('welcomeInfoNewcomers.header')}</h2>
      <ol className='pl5'>
        <Trans i18nKey='welcomeInfoNewcomers.paragraph1' t={t}>
          <li className='mb2 fw6 f3'>
            Add any Files and Folders in a space-efficient way
            <div className={'fw4 f5'}>IPFS has data deduplication embedded, so your disk will fill slower.</div>
          </li>
        </Trans>
        <Trans i18nKey='welcomeInfoNewcomers.paragraph2' t={t}>
          <li className='mb2 fw6 f3'>
            Send Content to other peers instantly
            <div className={'fw4 f5'}>
              Just click the Share button on the file/folder, enter/select the peer's address and click Send.<br/>
              The content will be sent directly without servers (if its computer is connected).
            </div>
          </li>
        </Trans>
        <Trans i18nKey='welcomeInfoNewcomers.paragraph3' t={t}>
          <li className='mb2 fw6 f3'>
            Receive Content from other peers instantly
            <div className={'fw4 f5'}>
              Copy and send your <i>DB ADDRESS</i> to your friends so they can share content to you.<br/>
              When someone sends a file/folder to you, the content will appear in the <i>"Shared with me"</i> folder.<br/>
              <i>PS: Your address is shown in the STATUS page</i>
            </div>
          </li>
        </Trans>
        <Trans i18nKey='welcomeInfoNewcomers.paragraph4' t={t}>
          <li className='mb2 fw6 f3'>
            Manage your Friends list
            <div className={'fw4 f5'}>
              The peer's DB ADDRESS will be saved in your Friends list after sharing content to them.<br/>
              Click the Share button again and assign a name to your friend by clicking the Edit pen icon!
            </div>
          </li>
        </Trans>
      </ol>
      <Trans i18nKey='welcomeInfoNewcomers.finalNote' t={t}>
        <h3 className={'fw4 f3 text-center'}>
          ??? Let's get started by importing a file! ???
          <div className={'fw3 f5'}>(click the blinking FILES icon to start)</div>
          <div className={'fw3 f5'}>Note: This is the official app of IPFS. Andrei Vaida added the Share functionality (i.e. points 2,3 and 4).</div>
        </h3>
      </Trans>
    </Box>
  )
}

export default withTranslation('welcome')(AboutWebUiNewcomers)
