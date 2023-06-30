import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useEffect, useMemo, useRef } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { isTruthy } from 'legacy/utils/misc'

import { ComposableCoW } from 'abis/types'

import { TWAP_PENDING_STATUSES } from '../const'
import { useFetchTwapOrdersFromSafe } from '../hooks/useFetchTwapOrdersFromSafe'
import { useTwapDiscreteOrders } from '../hooks/useTwapDiscreteOrders'
import { useTwapOrdersAuthMulticall } from '../hooks/useTwapOrdersAuthMulticall'
import { useTwapOrdersExecutions } from '../hooks/useTwapOrdersExecutions'
import { twapOrdersAtom, updateTwapOrdersListAtom } from '../state/twapOrdersListAtom'
import { TwapOrderInfo } from '../types'
import { buildTwapOrdersItems } from '../utils/buildTwapOrdersItems'
import { getConditionalOrderId } from '../utils/getConditionalOrderId'
import { isTwapOrderExpired } from '../utils/getTwapOrderStatus'
import { isTwapOrderJustMined } from '../utils/isTwapOrderJustMined'
import { parseTwapOrderStruct } from '../utils/parseTwapOrderStruct'

export function TwapOrdersUpdater(props: {
  safeAddress: string
  chainId: SupportedChainId
  composableCowContract: ComposableCoW
}) {
  const { safeAddress, chainId, composableCowContract } = props

  const twapDiscreteOrders = useTwapDiscreteOrders()
  const twapOrdersList = useAtomValue(twapOrdersAtom)
  const updateTwapOrders = useUpdateAtom(updateTwapOrdersListAtom)
  const ordersSafeData = useFetchTwapOrdersFromSafe(props)

  const allOrdersInfo: TwapOrderInfo[] = useMemo(() => {
    return ordersSafeData
      .map((data) => {
        try {
          const id = getConditionalOrderId(data.conditionalOrderParams)
          const order = parseTwapOrderStruct(data.conditionalOrderParams.staticInput)
          const { executionDate } = data.safeTxParams

          return {
            id,
            orderStruct: order,
            safeData: data,
            isExpired: isTwapOrderExpired(order, executionDate ? new Date(executionDate) : null),
          }
        } catch (e) {
          return null
        }
      })
      .filter(isTruthy)
  }, [ordersSafeData])

  const ordersIds = useMemo(() => allOrdersInfo.map((item) => item.id), [allOrdersInfo])

  const _twapOrderExecutions = useTwapOrdersExecutions(ordersIds)
  const twapOrderExecutions = useRef(_twapOrderExecutions)
  twapOrderExecutions.current = _twapOrderExecutions

  // Here we can split all orders in two groups: 1. Not signed + expired, 2. Open + cancelled
  const pendingOrCancelledOrders = useMemo(() => {
    return allOrdersInfo.filter((info) => {
      if (isTwapOrderJustMined(info.safeData.safeTxParams.executionDate)) return false

      const existingOrder = twapOrdersList[info.id]

      if (existingOrder) {
        return TWAP_PENDING_STATUSES.includes(existingOrder.status)
      }

      return !info.isExpired && info.safeData.safeTxParams.isExecuted
    })
  }, [allOrdersInfo, twapOrdersList])

  // Here we know which orders are cancelled: if it's auth === false, then it's cancelled
  const ordersAuthResult = useTwapOrdersAuthMulticall(safeAddress, composableCowContract, pendingOrCancelledOrders)

  useEffect(() => {
    if (!ordersAuthResult || !twapDiscreteOrders) return

    const items = buildTwapOrdersItems(
      chainId,
      safeAddress,
      allOrdersInfo,
      ordersAuthResult,
      twapDiscreteOrders,
      twapOrderExecutions.current
    )
    updateTwapOrders(items)
  }, [chainId, safeAddress, allOrdersInfo, ordersAuthResult, twapDiscreteOrders, updateTwapOrders])

  return null
}
