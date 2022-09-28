import { atomWithStorage } from 'jotai/utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { WRAPPED_NATIVE_CURRENCY as WETH } from 'constants/tokens'
import { useAtom } from 'jotai'
import { useMemo } from 'react'
import { parameterizeLimitOrdersRoute } from '@src/cow-react/modules/limitOrders/hooks/useParameterizeLimitOrdersRoute'
import { useHistory } from 'react-router-dom'

export interface LimitOrdersState {
  readonly chainId: number | null
  readonly inputCurrencyId: string | null
  readonly outputCurrencyId: string | null
  readonly inputCurrencyAmount: string | null
  readonly outputCurrencyAmount: string | null
  readonly recipient: string | null
}

export interface LimitOrdersStateManager {
  state: LimitOrdersState
  setState(state: LimitOrdersState): void
  setInputCurrencyAmount(inputCurrencyAmount: string | null): void
  setOutputCurrencyAmount(outputCurrencyAmount: string | null): void
  setRecipient(recipient: string | null): void
  navigate(
    chainId: SupportedChainId | null | undefined,
    outputCurrencyId: string | null,
    inputCurrencyId: string | null
  ): void
}

export function getDefaultLimitOrdersState(chainId: SupportedChainId | null): LimitOrdersState {
  return {
    chainId,
    inputCurrencyId: chainId ? WETH[chainId]?.symbol || null : null,
    outputCurrencyId: null,
    inputCurrencyAmount: null,
    outputCurrencyAmount: null,
    recipient: null,
  }
}

export const limitOrdersAtom = atomWithStorage<LimitOrdersState>('limit-orders-atom', getDefaultLimitOrdersState(null))

export const useLimitOrdersStateManager = (): LimitOrdersStateManager => {
  const history = useHistory()
  const [state, setState] = useAtom(limitOrdersAtom)

  return useMemo(() => {
    return {
      state,
      setState(state: LimitOrdersState) {
        setState(state)
      },
      setInputCurrencyAmount(inputCurrencyAmount: string | null) {
        setState({ ...state, inputCurrencyAmount })
      },
      setOutputCurrencyAmount(outputCurrencyAmount: string | null) {
        setState({ ...state, outputCurrencyAmount })
      },
      setRecipient(recipient: string | null) {
        setState({ ...state, recipient })
      },
      navigate(
        chainId: SupportedChainId | null | undefined,
        outputCurrencyId: string | null,
        inputCurrencyId: string | null
      ) {
        const route = parameterizeLimitOrdersRoute(chainId, outputCurrencyId, inputCurrencyId)

        history.push(route)
      },
    }
  }, [history, state, setState])
}
