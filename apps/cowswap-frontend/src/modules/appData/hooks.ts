import { useAtomValue, useSetAtom } from 'jotai'
import { useMemo } from 'react'

import { isInjectedWidget } from '@cowswap/common-utils'

import { DEFAULT_APP_CODE, SAFE_APP_CODE } from 'legacy/constants'

import { useIsSafeApp } from 'modules/wallet'

import { addAppDataToUploadQueueAtom, appDataInfoAtom } from './state/atoms'
import { AppDataInfo } from './types'

import { injectedWidgetMetaDataAtom } from '../injectedWidget/state/injectedWidgetMetaDataAtom'

const APP_CODE = process.env.REACT_APP_APP_CODE

export function useAppData(): AppDataInfo | null {
  return useAtomValue(appDataInfoAtom)
}

export function useAppCode(): string | null {
  const injectedWidgetMetaData = useAtomValue(injectedWidgetMetaDataAtom)
  const isSafeApp = useIsSafeApp()

  return useMemo(() => {
    if (isInjectedWidget()) {
      return injectedWidgetMetaData?.appKey || null
    }

    if (APP_CODE) {
      // appCode coming from env var has priority
      return APP_CODE
    }

    return isSafeApp ? SAFE_APP_CODE : DEFAULT_APP_CODE
  }, [isSafeApp, injectedWidgetMetaData])
}

export function useUploadAppData() {
  return useSetAtom(addAppDataToUploadQueueAtom)
}
