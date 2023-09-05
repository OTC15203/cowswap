import { default as AlphaImage } from '../../api/assets/alpha.svg'
import { ConnectionType } from '../../api/types'
import { getIsAlphaWallet } from '../../api/utils/connection'
import { WalletConnectLabeledOption } from '../containers/WalletConnectLabeledOption'

import { TryActivation } from '.'

const alphaOption = {
  color: '#4196FC',
  icon: AlphaImage,
  id: 'alpha',
}

export function AlphaOption({ tryActivation }: { tryActivation: TryActivation }) {
  return (
    <WalletConnectLabeledOption
      options={alphaOption}
      checkWalletName={getIsAlphaWallet}
      tryActivation={tryActivation}
      connectionType={ConnectionType.ALPHA}
    />
  )
}