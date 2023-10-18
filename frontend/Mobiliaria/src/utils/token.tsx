import { StorageKeysEnum } from '@interfaces/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const getAccessTokenAsync = async (): Promise<string | null> => {

    const refreshToken = await AsyncStorage.getItem(StorageKeysEnum.refreshToken)
    return refreshToken
}