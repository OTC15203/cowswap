import { useCallback } from 'react'
import { useUpdateAtom } from 'jotai/utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { FractionUtils } from '@cow/utils/fractionUtils'
import tryParseCurrencyAmount from '@src/lib/utils/tryParseCurrencyAmount'
import { updateAdvancedOrdersAtom } from '../state/advancedOrdersAtom'
import { Field } from '@src/state/swap/actions'

type AmountType = {
  value: string
  isTyped: boolean
}

type UpdateCurrencyAmountProps = {
  currency: Currency | undefined | null
  amount: AmountType
  field: Field
}

// TODO: probably also can be unified with other trade widgets
export function useUpdateCurrencyAmount() {
  const updateAdvancedOrdersState = useUpdateAtom(updateAdvancedOrdersAtom)

  return useCallback(
    ({ field, currency, amount }: UpdateCurrencyAmountProps) => {
      if (!currency) {
        return
      }

      const { isTyped, value } = amount

      // Value can be from user typed input or from quote API response
      // If the value is 3 ETH for example, first one will be 3 and second one 3 * 10**18
      // So we need to parse them differently to CurrencyAmount and we use isTyped flag for that
      const parsedAmount = isTyped
        ? tryParseCurrencyAmount(value, currency)
        : CurrencyAmount.fromRawAmount(currency, value)

      const currencyAmount = FractionUtils.serializeFractionToJSON(parsedAmount)
      const currencyField = field === Field.INPUT ? 'inputCurrencyAmount' : 'outputCurrencyAmount'

      updateAdvancedOrdersState({ [currencyField]: currencyAmount })
    },
    [updateAdvancedOrdersState]
  )
}