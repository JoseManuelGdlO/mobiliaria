import { StorageKeysEnum } from '@interfaces/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const getAccessTokenAsync = async (): Promise<string | null> => {
    const accessToken = await AsyncStorage.getItem(StorageKeysEnum.accessToken)
    return accessToken
}

export const getRefreshTokenAsync = async (): Promise<string | null> => {
    const refreshToken = await AsyncStorage.getItem(StorageKeysEnum.refreshToken)
    return refreshToken
}

export const saveSessionTokens = async (
    accessToken: string,
    refreshToken: string
): Promise<void> => {
    await AsyncStorage.multiSet([
        [StorageKeysEnum.accessToken, accessToken],
        [StorageKeysEnum.refreshToken, refreshToken],
    ])
}

export const clearSessionTokens = async (): Promise<void> => {
    await AsyncStorage.multiRemove([
        StorageKeysEnum.accessToken,
        StorageKeysEnum.refreshToken,
    ])
}