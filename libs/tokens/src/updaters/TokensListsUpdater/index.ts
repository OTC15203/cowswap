import { useAtomValue, useSetAtom } from 'jotai'
import useSWR, { SWRConfiguration } from 'swr'
import { useEffect } from 'react'

import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'

import { allListsSourcesAtom, tokenListsUpdatingAtom } from '../../state/tokenLists/tokenListsStateAtom'
import { fetchTokenList } from '../../services/fetchTokenList'
import { environmentAtom, updateEnvironmentAtom } from '../../state/environmentAtom'
import { getFulfilledResults, getIsTimeToUpdate, TOKENS_LISTS_UPDATER_INTERVAL } from './helpers'
import { ListState } from '../../types'
import { upsertListsAtom } from '../../state/tokenLists/tokenListsActionsAtom'
import { atomWithStorage } from 'jotai/utils'
import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
import { getJotaiMergerStorage } from '@cowprotocol/core'

const { atom: lastUpdateTimeAtom, updateAtom: updateLastUpdateTimeAtom } = atomWithPartialUpdate(
  atomWithStorage<Record<SupportedChainId, number>>(
    'tokens:lastUpdateTimeAtom:v0',
    mapSupportedNetworks(0),
    getJotaiMergerStorage()
  )
)

const swrOptions: SWRConfiguration = {
  refreshInterval: TOKENS_LISTS_UPDATER_INTERVAL,
  revalidateOnFocus: false,
}

interface TokensListsUpdaterProps {
  chainId: SupportedChainId
}

export function TokensListsUpdater({ chainId: currentChainId }: TokensListsUpdaterProps) {
  const { chainId } = useAtomValue(environmentAtom)
  const setEnvironment = useSetAtom(updateEnvironmentAtom)
  const allTokensLists = useAtomValue(allListsSourcesAtom)
  const lastUpdateTimeState = useAtomValue(lastUpdateTimeAtom)
  const updateLastUpdateTime = useSetAtom(updateLastUpdateTimeAtom)

  const setTokenListsUpdating = useSetAtom(tokenListsUpdatingAtom)
  const upsertLists = useSetAtom(upsertListsAtom)

  useEffect(() => {
    setEnvironment({ chainId: currentChainId })
  }, [setEnvironment, currentChainId])

  // Fetch tokens lists once in 6 hours
  const { data: listsStates, isLoading } = useSWR<ListState[] | null>(
    ['TokensListsUpdater', allTokensLists, chainId, lastUpdateTimeState],
    () => {
      if (!getIsTimeToUpdate(lastUpdateTimeState[chainId])) return null

      return Promise.allSettled(allTokensLists.map(fetchTokenList)).then(getFulfilledResults)
    },
    swrOptions
  )

  // Fulfill tokens lists with tokens from fetched lists
  useEffect(() => {
    setTokenListsUpdating(isLoading)

    if (isLoading || !listsStates) return

    updateLastUpdateTime({ [chainId]: Date.now() })

    upsertLists(chainId, listsStates)
  }, [listsStates, isLoading, chainId, upsertLists, setTokenListsUpdating, updateLastUpdateTime])

  return null
}
