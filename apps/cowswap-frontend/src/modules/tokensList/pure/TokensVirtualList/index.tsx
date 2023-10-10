import { useCallback, useMemo, useRef } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { useVirtualizer } from '@tanstack/react-virtual'
import ms from 'ms.macro'

import * as styledEl from './styled'

import { SelectTokenContext } from '../../types'
import { tokensListSorter } from '../../utils/tokensListSorter'
import { CommonListContainer } from '../commonElements'
import { TokenListItem } from '../TokenListItem'

const estimateSize = () => 56
const threeDivs = () => (
  <>
    <div />
    <div />
    <div />
  </>
)

const scrollDelay = ms`400ms`

export interface TokensVirtualListProps extends SelectTokenContext {
  allTokens: TokenWithLogo[]
}

export function TokensVirtualList(props: TokensVirtualListProps) {
  const { allTokens, selectedToken, balances, onSelectToken, unsupportedTokens, permitCompatibleTokens } = props
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()
  const parentRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const onScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
      if (wrapperRef.current) wrapperRef.current.style.pointerEvents = 'none'
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (wrapperRef.current) wrapperRef.current.style.pointerEvents = ''
    }, scrollDelay)
  }, [])

  const virtualizer = useVirtualizer({
    getScrollElement: () => parentRef.current,
    count: allTokens.length,
    estimateSize,
    overscan: 5,
  })

  const sortedTokens = useMemo(() => {
    return balances ? allTokens.sort(tokensListSorter(balances)) : allTokens
  }, [allTokens, balances])

  const { getVirtualItems } = virtualizer

  return (
    <CommonListContainer id="tokens-list" ref={parentRef} onScroll={onScroll}>
      <styledEl.TokensInner ref={wrapperRef} style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {getVirtualItems().map((virtualRow) => {
          const token = sortedTokens[virtualRow.index]
          const addressLowerCase = token.address.toLowerCase()
          const balance = balances ? balances[token.address] : null

          if (balance?.loading) {
            return <styledEl.LoadingRows key={virtualRow.key}>{threeDivs()}</styledEl.LoadingRows>
          }

          return (
            <TokenListItem
              key={virtualRow.key}
              virtualRow={virtualRow}
              token={token}
              isUnsupported={!!unsupportedTokens[addressLowerCase]}
              isPermitCompatible={permitCompatibleTokens[addressLowerCase]}
              selectedToken={selectedToken}
              balance={balance?.value}
              onSelectToken={onSelectToken}
            />
          )
        })}
      </styledEl.TokensInner>
    </CommonListContainer>
  )
}
