import { initializeConnector } from '@web3-react/core'
import { Connector } from '@web3-react/types'

import { useIsActiveWallet } from 'legacy/hooks/useIsActiveWallet'

import { default as TrustImage } from '../../api/assets/trust.svg'
import { ConnectWalletOption } from '../../api/pure/ConnectWalletOption'
import { ConnectionType } from '../../api/types'
import { getConnectionName, getIsTrustWallet } from '../../api/utils/connection'
import { InjectedWallet } from '../connectors/Injected'
import { WalletConnectLabeledOption } from '../containers/WalletConnectLabeledOption'
import { Web3ReactConnection } from '../types'

const WALLET_LINK = 'https://trustwallet.com/'
const BASE_PROPS = {
  color: '#4196FC',
  icon: TrustImage,
  id: 'trust',
}

const [trustWallet, trustWalletHooks] = initializeConnector<Connector>(
  (actions) =>
    new InjectedWallet({
      actions,
      walletUrl: WALLET_LINK,
      searchKeywords: ['isTrust', 'isTrustWallet'],
    })
)
export const trustWalletConnection: Web3ReactConnection = {
  connector: trustWallet,
  hooks: trustWalletHooks,
  type: ConnectionType.TRUST,
}

export function TrustWalletInjectedOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  const isActive = useIsActiveWallet(trustWalletConnection)

  return (
    <ConnectWalletOption
      {...BASE_PROPS}
      isActive={isActive}
      onClick={() => tryActivation(trustWalletConnection.connector)}
      header={getConnectionName(ConnectionType.TRUST)}
    />
  )
}

export function TrustWalletWCOption({ tryActivation }: { tryActivation: (connector: Connector) => void }) {
  return (
    <WalletConnectLabeledOption
      options={BASE_PROPS}
      checkWalletName={getIsTrustWallet}
      tryActivation={tryActivation}
      connectionType={ConnectionType.TRUST}
    />
  )
}

const e = window.ethereum
export const TrustWalletOption =
  e && (e.isTrust || e.isTrustWallet || e.providers?.find((p: any) => p.isTrust || p.isTrustWallet))
    ? TrustWalletInjectedOption
    : TrustWalletWCOption