import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useState } from 'react'

import { addListAnalytics } from '@cowprotocol/analytics'
import { useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import {
  ListState,
  useAddList,
  useAddUserToken,
  useAllListsList,
  useAllTokens,
  useFavouriteTokens,
  useUnsupportedTokens,
  useUserAddedTokens,
} from '@cowprotocol/tokens'

import styled from 'styled-components/macro'

import { usePermitCompatibleTokens } from 'modules/permit'

import { CowModal } from 'common/pure/Modal'

import { ImportListModal } from '../../pure/ImportListModal'
import { ImportTokenModal } from '../../pure/ImportTokenModal'
import { SelectTokenModal } from '../../pure/SelectTokenModal'
import { selectTokenWidgetAtom, updateSelectTokenWidgetAtom } from '../../state/selectTokenWidgetAtom'
import { ManageListsAndTokens } from '../ManageListsAndTokens'

const Wrapper = styled.div`
  width: 100%;

  > div {
    height: 100%;
  }
`

export function SelectTokenWidget() {
  const { open, onSelectToken, tokenToImport, listToImport, selectedToken, onInputPressEnter } =
    useAtomValue(selectTokenWidgetAtom)
  const [isManageWidgetOpen, setIsManageWidgetOpen] = useState(false)

  const updateSelectTokenWidget = useSetAtom(updateSelectTokenWidgetAtom)

  const addCustomTokenLists = useAddList()
  const importTokenCallback = useAddUserToken()

  const allTokens = useAllTokens()
  const favouriteTokens = useFavouriteTokens()
  const userAddedTokens = useUserAddedTokens()
  const allTokenLists = useAllListsList()
  const balancesState = useTokensBalances()
  const unsupportedTokens = useUnsupportedTokens()
  const permitCompatibleTokens = usePermitCompatibleTokens()

  const closeTokenSelectWidget = useCallback(() => {
    updateSelectTokenWidget({
      open: false,
      selectedToken: undefined,
      onSelectToken: undefined,
      tokenToImport: undefined,
      listToImport: undefined,
    })
  }, [updateSelectTokenWidget])

  const resetTokenImport = () => {
    updateSelectTokenWidget({
      tokenToImport: undefined,
    })
  }

  const onDismiss = () => {
    setIsManageWidgetOpen(false)
    closeTokenSelectWidget()
  }

  const importTokenAndClose = (tokens: TokenWithLogo[]) => {
    importTokenCallback(tokens)
    onSelectToken?.(tokens[0])
    onDismiss()
  }

  const importListAndBack = (list: ListState) => {
    addCustomTokenLists(list)
    updateSelectTokenWidget({ listToImport: undefined })
    addListAnalytics('Success', list.source)
  }

  if (!onSelectToken) return null

  return (
    <CowModal isOpen={open} onDismiss={onDismiss}>
      <Wrapper>
        {(() => {
          if (tokenToImport) {
            return (
              <ImportTokenModal
                tokens={[tokenToImport]}
                onDismiss={onDismiss}
                onBack={resetTokenImport}
                onImport={importTokenAndClose}
              />
            )
          }

          if (listToImport) {
            return (
              <ImportListModal
                list={listToImport}
                onDismiss={onDismiss}
                onBack={resetTokenImport}
                onImport={importListAndBack}
              />
            )
          }

          if (isManageWidgetOpen) {
            return (
              <ManageListsAndTokens
                lists={allTokenLists}
                customTokens={userAddedTokens}
                onDismiss={onDismiss}
                onBack={() => setIsManageWidgetOpen(false)}
              />
            )
          }

          return (
            <SelectTokenModal
              unsupportedTokens={unsupportedTokens}
              selectedToken={selectedToken}
              allTokens={allTokens}
              favouriteTokens={favouriteTokens}
              balancesState={balancesState}
              permitCompatibleTokens={permitCompatibleTokens}
              onSelectToken={onSelectToken}
              onInputPressEnter={onInputPressEnter}
              onDismiss={onDismiss}
              onOpenManageWidget={() => setIsManageWidgetOpen(true)}
            ></SelectTokenModal>
          )
        })()}
      </Wrapper>
    </CowModal>
  )
}
