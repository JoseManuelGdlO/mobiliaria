import { NativeModules } from 'react-native'
import { WidgetDaySnapshot } from './types'

type EventWidgetSyncModule = {
  saveSnapshot: (payload: string) => Promise<boolean>
  requestBackgroundRefresh: () => Promise<boolean>
}

const nativeModule = NativeModules.EventWidgetSync as EventWidgetSyncModule | undefined

export const syncWidgetSnapshot = async (snapshot: WidgetDaySnapshot): Promise<void> => {
  if (nativeModule == null) {
    return
  }

  await nativeModule.saveSnapshot(JSON.stringify(snapshot))
}

export const requestWidgetRefresh = async (): Promise<void> => {
  if (nativeModule == null) {
    return
  }

  await nativeModule.requestBackgroundRefresh()
}
