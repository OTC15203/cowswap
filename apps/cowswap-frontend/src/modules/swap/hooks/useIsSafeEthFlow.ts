import { useIsBundlingSupported } from '@cowswap/wallet'

import { useIsSwapEth } from './useIsSwapEth'

export function useIsSafeEthFlow(): boolean {
  const isSwapEth = useIsSwapEth()
  const isBundlingSupported = useIsBundlingSupported()

  return isBundlingSupported && isSwapEth
}
