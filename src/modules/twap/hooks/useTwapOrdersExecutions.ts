import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { Order, OrderInfoApi } from 'legacy/state/orders/actions'
import { useOrders } from 'legacy/state/orders/hooks'

import { useWalletInfo } from 'modules/wallet'

import { DEFAULT_TWAP_EXECUTION_INFO } from '../const'
import { twapPartOrdersAtom } from '../state/twapPartOrdersAtom'
import { TwapOrderExecutionInfo } from '../types'

export type TwapOrdersExecutionMap = { [id: string]: TwapOrderExecutionInfo }

export function useTwapOrdersExecutions(ids: string[]): TwapOrdersExecutionMap {
  const { chainId } = useWalletInfo()
  const twapPartOrders = useAtomValue(twapPartOrdersAtom)

  const allOrders = useOrders({ chainId })

  return useMemo(() => {
    return ids.reduce<TwapOrdersExecutionMap>((acc, id) => {
      const childrenIds = (twapPartOrders[id] || []).map((item) => item.uid)

      if (childrenIds.length > 0) {
        const children = allOrders.filter((order) => childrenIds.includes(order.id))

        const executedBuyAmount = sumChildrenAmount(children, 'executedBuyAmount').toString()
        const executedSellAmount = sumChildrenAmount(children, 'executedSellAmount').toString()
        const executedFeeAmount = sumChildrenAmount(children, 'executedFeeAmount').toString()

        acc[id] = { executedSellAmount, executedFeeAmount, executedBuyAmount }
      }

      if (!acc[id]) {
        acc[id] = DEFAULT_TWAP_EXECUTION_INFO
      }

      return acc
    }, {})
  }, [ids, twapPartOrders, allOrders])
}

function sumChildrenAmount(children: Order[], key: keyof OrderInfoApi): BigInt {
  return children.reduce((acc, order) => {
    return acc + BigInt((order.apiAdditionalInfo?.[key] || '0') as string)
  }, BigInt(0))
}
