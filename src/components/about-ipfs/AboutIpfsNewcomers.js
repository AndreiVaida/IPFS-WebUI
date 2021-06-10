import React from 'react'
import { Trans, withTranslation } from 'react-i18next'
import Box from '../box/Box'

export const AboutIpfsNewcomers = ({ t }) => {
  return (
    <Box className={'pt0'}>
      <h2 className='mt0 mb3 montserrat fw1 f2 charcoal text-center'>{t('aboutIpfsNewcomers.header1')}</h2>
      <div className='fw1 f3 text-center'>
        {t('aboutIpfsNewcomers.header2')}
      </div>
      <ul className='mt2 pl5'>
        <Trans i18nKey='aboutIpfsNewcomers.paragraph1' t={t}>
          <li className='mb2 fw6 f4'>
            Data is distributed directly from other people's computers to yours (and vice-versa). There are no servers.
            <div className={'fw4'}>
              Thus, the storage in IPFS in free and unlimited! (until your drive gets full)<br/>
              Pay attention that yours and your friend's computer must be connected to IPFS in order to exchange data.
            </div>
          </li>
        </Trans>
        <Trans i18nKey='aboutIpfsNewcomers.paragraph2' t={t}>
          <li className='mb2 fw6 f4'>
            A file is uniquely identified by its content itself, not by an address. CID is used instead of URL.
            <div className={'fw4'}>
              If you change even a letter in a file, IPFS will instantly identify it as a different file.<br/>
              Content is splitted in chunks that can be downloaded and uploaded independently.
            </div>
          </li>
        </Trans>
        <Trans i18nKey='aboutIpfsNewcomers.paragraph3' t={t}>
          <li className='mb2 fw6 f4'>
            Peers can retrieve content from anyone who has it.
            <div className={'fw4'}>
              Movies and other content is downloaded from your neighbors faster than from a congested server on another continent.<br/>
              Your computer automatically uploads (only imported) content to others, when they ask for it.
            </div>
          </li>
        </Trans>
      </ul>
    </Box>
  )
}

export default withTranslation('welcome')(AboutIpfsNewcomers)
