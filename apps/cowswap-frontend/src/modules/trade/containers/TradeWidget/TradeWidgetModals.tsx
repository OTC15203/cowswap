import { ReactNode, useEffect } from 'react'

import { useAddUserToken } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import {
  ImportTokenModal,
  SelectTokenWidget,
  useSelectTokenWidgetState,
  useUpdateSelectTokenWidgetState,
} from 'modules/tokensList'
import { useZeroApproveModalState, ZeroApprovalModal } from 'modules/zeroApproval'

import { TradeApproveModal } from 'common/containers/TradeApprove'
import { useTradeApproveState } from 'common/hooks/useTradeApproveState'
import { useUpdateTradeApproveState } from 'common/hooks/useUpdateTradeApproveState'

import { useAutoImportTokensState } from '../../hooks/useAutoImportTokensState'
import { useTradeConfirmActions } from '../../hooks/useTradeConfirmActions'
import { useTradeConfirmState } from '../../hooks/useTradeConfirmState'
import { useTradeState } from '../../hooks/useTradeState'
import { useWrapNativeScreenState } from '../../hooks/useWrapNativeScreenState'
import { WrapNativeModal } from '../WrapNativeModal'

export function TradeWidgetModals(confirmModal: ReactNode | undefined) {
  const { chainId, account } = useWalletInfo()
  const { state: rawState } = useTradeState()
  const importTokenCallback = useAddUserToken()

  const { isOpen: isTradeReviewOpen } = useTradeConfirmState()
  const { open: isTokenSelectOpen } = useSelectTokenWidgetState()
  const [{ isOpen: isWrapNativeOpen }, setWrapNativeScreenState] = useWrapNativeScreenState()
  const { approveInProgress, currency: approvingCurrency } = useTradeApproveState()

  const { isModalOpen: isZeroApprovalModalOpen, closeModal: closeZeroApprovalModal } = useZeroApproveModalState()
  const {
    tokensToImport,
    modalState: { isModalOpen: isAutoImportModalOpen, closeModal: closeAutoImportModal },
  } = useAutoImportTokensState(rawState?.inputCurrencyId, rawState?.outputCurrencyId)

  const { onDismiss: closeTradeConfirm } = useTradeConfirmActions()
  const updateSelectTokenWidgetState = useUpdateSelectTokenWidgetState()
  const updateTradeApproveState = useUpdateTradeApproveState()

  /**
   * Close modals on chain/account change
   */
  useEffect(() => {
    closeTradeConfirm()
    closeZeroApprovalModal()
    closeAutoImportModal()
    updateSelectTokenWidgetState({ open: false })
    setWrapNativeScreenState({ isOpen: false })
    updateTradeApproveState({ approveInProgress: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, account])

  if (isTradeReviewOpen) {
    return confirmModal
  }

  if (isAutoImportModalOpen) {
    return <ImportTokenModal tokens={tokensToImport} onDismiss={closeAutoImportModal} onImport={importTokenCallback} />
  }

  if (isTokenSelectOpen) {
    return <SelectTokenWidget />
  }

  if (isWrapNativeOpen) {
    return <WrapNativeModal />
  }
  if (approveInProgress) {
    return <TradeApproveModal currency={approvingCurrency} />
  }

  if (isZeroApprovalModalOpen) {
    return <ZeroApprovalModal onDismiss={closeZeroApprovalModal} />
  }

  return null
}
